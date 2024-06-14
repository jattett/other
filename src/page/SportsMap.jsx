import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Table } from 'antd';
import {
  setGymnasiums,
  setLoading,
  setMarkers,
  setRoadview,
} from '../actions/actions';

const SportsMap = () => {
  const dispatch = useDispatch();
  const { gyms, loading, roadview } = useSelector((state) => state.map);
  const [allGyms, setAllGyms] = useState([]);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [cityFilters, setCityFilters] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedRoadAddress, setSelectedRoadAddress] = useState('');

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
    if (gyms.length > 0) {
      const cities = [...new Set(gyms.map(gym => gym.SIGUN_NM))];
      const filters = cities.map(city => ({
        text: city,
        value: city,
      }));
      setCityFilters(filters);
    }
  }, [gyms]);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;

    const mapContainer = document.getElementById('map'); // 지도를 표시할 div
    const mapOption = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 지도의 중심좌표
      level: 3, // 지도의 확대 레벨
    };

    const newMap = new window.kakao.maps.Map(mapContainer, mapOption);
    setMap(newMap);

    const roadviewContainer = document.getElementById('roadview');
    const roadviewInstance = new window.kakao.maps.Roadview(roadviewContainer);
    dispatch(setRoadview(roadviewInstance));

    const newInfoWindow = new window.kakao.maps.InfoWindow({
      zIndex: 1,
      removable: true,
      content: '<div style="padding:5px;background:white;border:1px solid black;">주소 표시</div>',
    });
    setInfoWindow(newInfoWindow);
  }, [dispatch]);

  useEffect(() => {
    if (map && gyms.length > 0) {
      const combinedLocations = gyms.map(gym => ({
        key: gym.FACLT_NM,
        name: gym.FACLT_NM,
        city: gym.SIGUN_NM,
        roadAddress: gym.REFINE_ROADNM_ADDR,
        gyms: gym.POSBL_ITEM_NM,
        lat: gym.REFINE_WGS84_LAT,
        lng: gym.REFINE_WGS84_LOGT,
      }));
      setCombinedData(combinedLocations);
      updateMarkers(combinedLocations);
    }
  }, [map, gyms]);

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

  const searchPlaceByName = (name) => {
    const { kakao } = window;
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(name, placesSearchCB);
  };

  const placesSearchCB = (data, status) => {
    const { kakao } = window;
    if (status === kakao.maps.services.Status.OK) {
      const place = data[0]; // Get the first result
      if (place) {
        const position = new kakao.maps.LatLng(place.y, place.x);
        map.setCenter(position);
        map.setLevel(3);

        const marker = new window.kakao.maps.Marker({
          position,
        });
        marker.setMap(map);

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;">${place.place_name}</div>`,
        });
        infowindow.open(map, marker);

        const roadviewClient = new window.kakao.maps.RoadviewClient();
        roadviewClient.getNearestPanoId(position, 50, function (panoId) {
          if (panoId) {
            roadview.setPanoId(panoId, position);
          } else {
            alert('로드뷰를 사용할 수 없는 위치입니다.');
          }
        });

        // Update selected address and road address with Kakao Maps result
        setSelectedAddress(place.address_name || place.road_address_name);
        setSelectedRoadAddress(place.road_address_name || place.address_name);

        // Add the new marker to the markers state
        setMarkers(prevMarkers => [...prevMarkers, marker]);
      }
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
      alert('검색 결과가 존재하지 않습니다.');
    } else if (status === kakao.maps.services.Status.ERROR) {
      alert('검색 결과 중 오류가 발생했습니다.');
    }
  };

  const handleListItemClick = (index) => {
    const location = combinedData[index];
    if (location && location.name) {
      searchPlaceByName(location.name);
      const position = new window.kakao.maps.LatLng(location.lat, location.lng);
      if (infoWindow) {
        infoWindow.setContent(`<div style="padding:5px;background:white;border:1px solid black;">
          <strong>${location.name}</strong><br/>
          <small>${location.roadAddress}</small>
        </div>`);
        infoWindow.setPosition(position);
        infoWindow.open(map);
      }
    }
  };

  const handleNaviClick = () => {
    if (selectedRoadAddress || selectedAddress) {
        const destination = selectedRoadAddress || selectedAddress;
        window.open(`https://map.kakao.com/link/to/${destination}`);
    }
};

  const columns = [
    {
      title: '시설명',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '도시명',
      dataIndex: 'city',
      key: 'city',
      width: '50%',
      filters: cityFilters,
      onFilter: (value, record) => record.city.includes(value),
    },
    {
      title: '종목',
      dataIndex: 'gyms',
      key: 'gyms',
    },
  ];

  return (
    <div className="map_wrap">
      <div id="map" style={{ width: '100%', height: '500px', marginBottom: '10px', position: 'relative' }}>
        <div className='map_text_box' style={{ position: 'absolute', top: '10px', background: 'white', padding: '10px', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          <p className='map_text'>
            {selectedAddress}
          </p>
          <p className='map_text'>
            {selectedRoadAddress}
          </p>
          <button className='map_navi' onClick={handleNaviClick}>카카오네비연결</button>
        </div>
      </div>
      <div id="roadview" style={{ width: '100%', height: '350px', position: 'relative', overflow: 'hidden' }}></div>
      <div id="menu_wrap">
        <Table
          columns={columns}
          dataSource={combinedData}
          loading={loading}
          pagination={{ pageSize: 10 }}
          onRow={(record, rowIndex) => {
            return {
              onClick: () => handleListItemClick(rowIndex),
            };
          }}
        />
      </div>
    </div>
  );
};

export default SportsMap;
