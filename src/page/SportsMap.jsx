import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setMap, setMarkers, setRoadview, setCurrentPosition, setCurrentMarker } from '../actions/actions';

const SportsMap = () => {
  const dispatch = useDispatch();
  const { map, markers, roadview, currentPosition, currentMarker } = useSelector((state) => state.map);

  useEffect(() => {
    const { kakao } = window;
    const container = document.getElementById('map');
    const options = {
      center: new kakao.maps.LatLng(37.566826, 126.9786567),
      level: 3,
    };

    const mapInstance = new kakao.maps.Map(container, options);
    dispatch(setMap(mapInstance));

    const roadviewContainer = document.getElementById('roadview');
    const roadviewInstance = new kakao.maps.Roadview(roadviewContainer);
    dispatch(setRoadview(roadviewInstance));
  }, [dispatch]);

  const fetchGymnasiums = async () => {
    try {
      const response = await axios.get('https://openapi.gg.go.kr/PublicGameOfBallGymnasium', {
        params: {
          KEY: 'process.env.REACT_APP_GYM_API_KEY', // 여기에 실제 API 키를 입력하세요
          Type: 'json',
        },
      });

      if (response.data && response.data.PublicGameOfBallGymnasium[1].row) {
        const gymnasiums = response.data.PublicGameOfBallGymnasium[1].row;
        return gymnasiums;
      } else {
        console.error('No data found');
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch gymnasiums:', error);
      return [];
    }
  };

  const activateCurrentLocation = () => {
    const { kakao } = window;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const locPosition = new kakao.maps.LatLng(lat, lon);

        dispatch(setCurrentPosition(locPosition));

        if (map) {
          map.setCenter(locPosition);

          if (currentMarker) {
            currentMarker.setPosition(locPosition);
          } else {
            const marker = new kakao.maps.Marker({
              map: map,
              position: locPosition,
              title: '현재 위치',
            });
            dispatch(setCurrentMarker(marker));
          }
        }
      });
    } else {
      alert('현재 위치를 확인할 수 없습니다.');
    }
  };

  const addMarker = (position, title) => {
    const { kakao } = window;
    const marker = new kakao.maps.Marker({
      position,
    });

    kakao.maps.event.addListener(marker, 'click', function () {
      map.panTo(position);
      displayInfowindow(marker, title);

      const roadviewClient = new kakao.maps.RoadviewClient();
      roadviewClient.getNearestPanoId(position, 50, function (panoId) {
        roadview.setPanoId(panoId, position);
      });
    });

    marker.setMap(map);
    return marker;
  };

  const displayInfowindow = (marker, title) => {
    const { kakao } = window;
    const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
    const content = `<div style="padding:5px;z-index:1;">${title}</div>`;
    infowindow.setContent(content);
    infowindow.open(map, marker);
  };

  useEffect(() => {
    const { kakao } = window;
    const loadGymnasiums = async () => {
      const gymnasiums = await fetchGymnasiums();
      const bounds = new kakao.maps.LatLngBounds();
      const newMarkers = [];

      gymnasiums.forEach((gym) => {
        const position = new kakao.maps.LatLng(gym.REFINE_WGS84_LAT, gym.REFINE_WGS84_LOGT);
        const marker = addMarker(position, gym.FACLT_NM);
        newMarkers.push(marker);
        bounds.extend(position);
      });

      dispatch(setMarkers(newMarkers));
      map.setBounds(bounds);
    };

    if (map) {
      loadGymnasiums();
    }
  }, [map, dispatch]);

  return (
    <div>
      <div id="map" style={{ width: '100%', height: '800px', position: 'relative', overflow: 'hidden' }}></div>
      <div id="roadview" style={{ width: '100%', height: '350px', position: 'relative', overflow: 'hidden' }}></div>

      <div id="menu_wrap" className="bg_white">
        <div className="option">
          <div>
            <button onClick={activateCurrentLocation}>현재 위치</button>
          </div>
        </div>
        <hr />
      </div>
    </div>
  );
};

export default SportsMap;
