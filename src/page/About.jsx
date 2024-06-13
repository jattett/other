import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  setKeyword,
  setMap,
  setPlaces,
  setMarkers,
  setPagination,
  setRoadview,
  setCurrentPosition,
  setCurrentMarker,
  setAiInput,
} from '../actions/actions';

const About = () => {
  const dispatch = useDispatch();
  const { keyword, map, places, markers, pagination, roadview, currentPosition, currentMarker, aiInput } = useSelector(
    (state) => state.map
  );

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

  const searchPlaces = () => {
    const { kakao } = window;
    if (!keyword.trim()) {
      alert('키워드를 입력해주세요!');
      return;
    }

    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(keyword, placesSearchCB);
  };

  const placesSearchCB = (data, status, pagination) => {
    const { kakao } = window;
    if (status === kakao.maps.services.Status.OK) {
      const sortedPlaces = data
        .map((place) => {
          const distance = calculateDistance(new kakao.maps.LatLng(place.y, place.x));
          return { ...place, distance };
        })
        .sort((a, b) => a.distance - b.distance);

      dispatch(setPlaces(sortedPlaces));
      dispatch(setPagination(pagination));

      const bounds = new kakao.maps.LatLngBounds();
      const newMarkers = [];

      sortedPlaces.forEach((place, i) => {
        const position = new kakao.maps.LatLng(place.y, place.x);
        const marker = addMarker(position, i, place.place_name);
        newMarkers.push(marker);
        bounds.extend(position);
      });

      dispatch(setMarkers(newMarkers));
      map.setBounds(bounds);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
      alert('검색 결과가 존재하지 않습니다.');
    } else if (status === kakao.maps.services.Status.ERROR) {
      alert('검색 결과 중 오류가 발생했습니다.');
    }
  };

  const addMarker = (position, idx, title) => {
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

  const handleListItemClick = (index) => {
    const place = places[index];
    const marker = markers[index];
    if (place && marker) {
      const { kakao } = window;
      const position = new kakao.maps.LatLng(place.y, place.x);
      map.setLevel(3);
      map.panTo(position);
      displayInfowindow(marker, place.place_name);

      const roadviewClient = new kakao.maps.RoadviewClient();
      roadviewClient.getNearestPanoId(position, 50, function (panoId) {
        roadview.setPanoId(panoId, position);
      });
    }
  };

  const displayPagination = () => {
    if (!pagination) return null;
    const pages = [];

    for (let i = 1; i <= pagination.last; i++) {
      pages.push(
        <a key={i} href="#" className={i === pagination.current ? 'on' : ''} onClick={() => pagination.gotoPage(i)}>
          {i}
        </a>
      );
    }

    return pages;
  };

  const calculateDistance = (placePosition) => {
    const { kakao } = window;
    if (!currentPosition) return null;
    const polyline = new kakao.maps.Polyline({
      path: [currentPosition, placePosition],
    });
    return polyline.getLength();
  };

  const formatDistanceToKm = (distance) => {
    return (distance / 1000).toFixed(1);
  };

  const handleAiRecommendation = async () => {
    const apiKey = 'process.env.REACT_APP_OPENAI_API_KEY'; // OpenAI API 키를 여기에 추가하세요
    const prompt = `무슨말을 하든지 음식이름만 말해, 음식단어 만말하고 다른말은하지마`; // 프롬프트를 수정하여 항상 '맛집'을 반환하도록 함

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/completions',
        {
          model: 'gpt-3.5-turbo',
          prompt,
          max_tokens: 50,
          temperature: 0.8,
          top_p: 1,
          frequency_penalty: 0.5,
          presence_penalty: 0.5,
          stop: ['Human'],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      searchPlaces();
    } catch (error) {
      console.error('API 호출 중 오류가 발생했습니다:', error);
      alert('AI 추천을 가져오는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="map_wrap">
      <div id="map" style={{ width: '100%', height: '800px', position: 'relative', overflow: 'hidden' }}></div>
      <div id="roadview" style={{ width: '100%', height: '350px', position: 'relative', overflow: 'hidden' }}></div>

      <div id="menu_wrap" className="bg_white">
        <div className="option">
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                searchPlaces();
              }}
            >
              키워드:{' '}
              <input type="text" value={keyword} onChange={(e) => dispatch(setKeyword(e.target.value))} size="15" />
              <button type="submit">검색하기</button>
            </form>
            <button onClick={activateCurrentLocation}>현재 위치</button>
          </div>
          <div>
            <textarea
              value={aiInput}
              onChange={(e) => dispatch(setAiInput(e.target.value))}
              rows="4"
              cols="50"
              placeholder="장소 추천을 위한 입력을 여기에 입력하세요."
            />
            <button onClick={handleAiRecommendation}>AI 추천</button>
          </div>
        </div>
        <hr />
        <ul id="placesList">
          {places.map((place, index) => {
            const distance = place.distance; // 정렬된 place에서 거리 가져오기
            return (
              <li key={index} onClick={() => handleListItemClick(index)}>
                <span className={`markerbg marker_${index + 1}`}></span>
                <div className="info">
                  <h5>{place.place_name}</h5>
                  {place.road_address_name ? (
                    <>
                      <span>{place.road_address_name}</span>
                      <span className="jibun gray">{place.address_name}</span>
                    </>
                  ) : (
                    <span>{place.address_name}</span>
                  )}
                  <span className="tel">{place.phone}</span>
                  {distance !== null && <span className="distance">거리: {formatDistanceToKm(distance)}km</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <div id="pagination">{displayPagination()}</div>
      </div>
    </div>
  );
};

export default About;
