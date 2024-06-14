import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Table, Input, Button, Rate } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {
  setKeyword,
  setPlaces,
  setMarkers,
  setPagination,
  setCurrentPosition,
  setCurrentMarker,
  setAiInput,
} from '../actions/actions';
import './style.css';

const About = () => {
  const dispatch = useDispatch();
  const { keyword, places, markers, pagination, currentPosition, currentMarker, aiInput } = useSelector(
    (state) => state.map
  );

  const mapRef = useRef(null);
  const roadviewRef = useRef(null);

  useEffect(() => {
    const { kakao } = window;
    const container = document.getElementById('map');
    const options = {
      center: new kakao.maps.LatLng(37.566826, 126.9786567),
      level: 3,
    };

    const mapInstance = new kakao.maps.Map(container, options);
    mapRef.current = mapInstance;

    const roadviewContainer = document.getElementById('roadview');
    const roadviewInstance = new kakao.maps.Roadview(roadviewContainer);
    roadviewRef.current = roadviewInstance;
  }, []);

  const activateCurrentLocation = () => {
    const { kakao } = window;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const locPosition = new kakao.maps.LatLng(lat, lon);

        dispatch(setCurrentPosition(locPosition));

        if (mapRef.current) {
          mapRef.current.setCenter(locPosition);

          if (currentMarker) {
            currentMarker.setPosition(locPosition);
          } else {
            const marker = new kakao.maps.Marker({
              map: mapRef.current,
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
          // Add a random rating for demonstration purposes
          const rating = Math.random() * 5; // Replace this with actual rating data if available
          return { ...place, distance, rating };
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
      mapRef.current.setBounds(bounds);
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
      mapRef.current.panTo(position);
      displayInfowindow(marker, title);

      const roadviewClient = new kakao.maps.RoadviewClient();
      roadviewClient.getNearestPanoId(position, 50, function (panoId) {
        roadviewRef.current.setPanoId(panoId, position);
      });
    });

    marker.setMap(mapRef.current);
    return marker;
  };

  const displayInfowindow = (marker, title) => {
    const { kakao } = window;
    const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
    const content = `<div style="padding:5px;z-index:1;">${title}</div>`;
    infowindow.setContent(content);
    infowindow.open(mapRef.current, marker);
  };

  const handleListItemClick = (index) => {
    const place = places[index];
    const marker = markers[index];
    if (place && marker) {
      const { kakao } = window;
      const position = new kakao.maps.LatLng(place.y, place.x);
      mapRef.current.setLevel(3);
      mapRef.current.panTo(position);
      displayInfowindow(marker, place.place_name);

      const roadviewClient = new kakao.maps.RoadviewClient();
      roadviewClient.getNearestPanoId(position, 50, function (panoId) {
        roadviewRef.current.setPanoId(panoId, position);
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
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY; // OpenAI API key should be here
    const prompt = `무슨말을 하든지 음식이름만 말해, 음식단어 만말하고 다른말은하지마`; // 프롬프트를 수정하여 항상 '맛집'을 반환하도록 함

    if (!apiKey) {
      alert('API key is missing');
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          prompt,
          max_tokens: 50,
          temperature: 0.8,
          top_p: 1,
          frequency_penalty: 0.5,
          presence_penalty: 0.5,
          stop: ['Human']
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log(data); // Handle the response data

      // Call searchPlaces or handle the data as needed
      searchPlaces();
    } catch (error) {
      console.error('API 호출 중 오류가 발생했습니다:', error);
      alert('AI 추천을 가져오는 중 오류가 발생했습니다.');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'place_name',
      key: 'name',
    },
    {
      title: 'Road Address',
      dataIndex: 'road_address_name',
      key: 'roadAddress',
    },
    {
      title: 'Address',
      dataIndex: 'address_name',
      key: 'address',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Distance (km)',
      dataIndex: 'distance',
      key: 'distance',
      render: (distance) => formatDistanceToKm(distance),
      sorter: (a, b) => a.distance - b.distance,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <Rate disabled defaultValue={rating} allowHalf />,
      sorter: (a, b) => a.rating - b.rating,
    },
  ];

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
              <Input
                value={keyword}
                onChange={(e) => dispatch(setKeyword(e.target.value))}
                size="15"
                style={{ width: 200, marginRight: 10 }}
              />
              <Button type="primary" onClick={searchPlaces} icon={<SearchOutlined />}>
                검색하기
              </Button>
            </form>
            <Button onClick={activateCurrentLocation} style={{ marginLeft: 10 }}>
              현재 위치
            </Button>
          </div>
          <div>
            <Input.TextArea
              value={aiInput}
              onChange={(e) => dispatch(setAiInput(e.target.value))}
              rows="4"
              placeholder="장소 추천을 위한 입력을 여기에 입력하세요."
              style={{ width: '100%', marginTop: 10 }}
            />
            <Button onClick={handleAiRecommendation} type="primary" style={{ marginTop: 10 }}>
              AI 추천
            </Button>
          </div>
        </div>
        <hr />
        <Table
          columns={columns}
          dataSource={places}
          rowKey={(record) => record.id}
          pagination={{
            current: pagination ? pagination.current : 1,
            total: pagination ? pagination.totalCount : 0,
            pageSize: 15,
            onChange: (page) => pagination.gotoPage(page),
          }}
          onRow={(record, rowIndex) => {
            return {
              onClick: () => handleListItemClick(rowIndex),
            };
          }}
        />
        <div id="pagination">{displayPagination()}</div>
      </div>
    </div>
  );
};

export default About;
