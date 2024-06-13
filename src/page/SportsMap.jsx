import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Table, Input } from 'antd';
import {
  setGymnasiums,
  setLoading,
  setKeyword,
  setPlaces,
  setMarkers,
  setPagination,
} from '../actions/actions';

const { Search } = Input;

const SportsMap = () => {
  const dispatch = useDispatch();
  const { keyword, gyms, loading, currentPosition,roadview } = useSelector((state) => state.map);
  const [allGyms, setAllGyms] = useState([]);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    const fetchGyms = async () => {
      dispatch(setLoading(true));
      try {
        const response = await axios.get('https://openapi.gg.go.kr/PublicGameOfBallGymnasium', {
          params: {
            KEY: process.env.REACT_APP_GYM_API_KEY,
            Type: 'json',
            pIndex: 1,
            pSize: 200,
          },
        });
        console.log('API response:', response.data);
        const data = response.data.PublicGameOfBallGymnasium[1]?.row || [];
        setAllGyms(data);
        dispatch(setGymnasiums(data));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchGyms();
  }, [dispatch]);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;

    const mapContainer = document.getElementById('map'); // 지도를 표시할 div
    const mapOption = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 지도의 중심좌표
      level: 3, // 지도의 확대 레벨
    };

    const newMap = new window.kakao.maps.Map(mapContainer, mapOption);
    setMap(newMap);
  }, []);

  const updateMarkers = (locations) => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers = locations.map((location) => {
      const markerPosition = new window.kakao.maps.LatLng(location.lat, location.lng);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
      });

      marker.setMap(map);

      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;">${location.name}</div>`,
      });

      window.kakao.maps.event.addListener(marker, 'mouseover', function () {
        infowindow.open(map, marker);
      });

      window.kakao.maps.event.addListener(marker, 'mouseout', function () {
        infowindow.close();
      });

      return marker;
    });

    setMarkers(newMarkers);
  };

  const calculateDistance = (latLng) => {
    if (!currentPosition) return null;
    const { lat: currentLat, lng: currentLng } = currentPosition;
    const { lat, lng } = latLng;
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat - currentLat) * Math.PI / 180;
    const dLng = (lng - currentLng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(currentLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const searchGymsAndPlaces = (value) => {
    if (!value.trim()) {
      alert('키워드를 입력해주세요!');
      return;
    }

    // Filter local gyms
    const filteredGyms = allGyms.filter((gym) =>
      (gym.SIGUN_NM && gym.SIGUN_NM.toLowerCase().includes(value.toLowerCase())) ||
      (gym.FACLT_NM && gym.FACLT_NM.toLowerCase().includes(value.toLowerCase())) ||
      (gym.REFINE_ZIP_CD && gym.REFINE_ZIP_CD.toLowerCase().includes(value.toLowerCase()))
    );
    console.log('Filtered gyms:', filteredGyms);
    dispatch(setGymnasiums(filteredGyms));

    // Search places using Kakao Maps API
    const { kakao } = window;
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(value, placesSearchCB);
  };

  const placesSearchCB = (data, status, pagination) => {
    const { kakao } = window;
    if (status === kakao.maps.services.Status.OK) {
      const sortedPlaces = data
        .map((place) => {
          const distance = calculateDistance({ lat: parseFloat(place.y), lng: parseFloat(place.x) });
          return { ...place, distance, lat: parseFloat(place.y), lng: parseFloat(place.x) };
        })
        .sort((a, b) => a.distance - b.distance);

      setPlaces(sortedPlaces);
      dispatch(setPagination(pagination));

      const bounds = new kakao.maps.LatLngBounds();
      const newMarkers = [];

      sortedPlaces.forEach((place, i) => {
        const position = new kakao.maps.LatLng(place.y, place.x);
        const marker = addMarker(position, i, place.place_name);
        newMarkers.push(marker);
        bounds.extend(position);
      });

      setMarkers((prevMarkers) => [...prevMarkers, ...newMarkers]);
      map.setBounds(bounds);

      // Combine gyms and places
      const combinedLocations = [
        ...gyms.map(gym => ({
          name: gym.FACLT_NM,
          address: gym.REFINE_ZIP_CD,
          lat: gym.REFINE_WGS84_LAT,
          lng: gym.REFINE_WGS84_LOGT,
        })),
        ...sortedPlaces.map(place => ({
          name: place.place_name,
          address: place.road_address_name || place.address_name,
          lat: place.y,
          lng: place.x,
        })),
      ];

      updateMarkers(combinedLocations);
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
    const infowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:5px;">${title}</div>`,
    });
    infowindow.open(map, marker);
  };

  useEffect(() => {
    if (map && gyms.length > 0) {
      updateMarkers(gyms);
    }
  }, [map, gyms]);

  const columns = [
    {
      title: '시설명',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '주소',
      dataIndex: 'address',
      key: 'address',
      width: '50%',
    },
  ];

  const combinedData = [
    ...gyms.map(gym => ({
      key: gym.FACLT_NM,
      name: gym.FACLT_NM,
      address: gym.REFINE_ZIP_CD,
      lat: gym.REFINE_WGS84_LAT,
      lng: gym.REFINE_WGS84_LOGT,
    })),
    ...places.map(place => ({
      key: place.id,
      name: place.place_name,
      address: place.road_address_name || place.address_name,
      lat: place.y,
      lng: place.x,
    })),
  ];

  return (
    <div className="map_wrap">
      <div id="map" style={{ width: '100%', height: '500px', marginBottom: '10px' }}></div>
      <div id="menu_wrap">
        <div className="option">
          <div>
            <Search
              placeholder="키워드를 입력하세요"
              enterButton="검색하기"
              size="large"
              onSearch={searchGymsAndPlaces}
            />
          </div>
        </div>
        <hr />
        <Table
          columns={columns}
          dataSource={combinedData}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
};

export default SportsMap;
