(function () {
  "use strict";

  function getElement(target) {
    return document.querySelector(target);
  }

  let map;
  let marker;

  const $mapContainer = getElement("#map");
  const $searchResultLat = getElement("#search-result-latitude");
  const $searchResultLng = getElement("#search-result-longitude");
  const $inputAddress = getElement("#input-address");
  const $inputAddressButton = getElement("#input-address-button");
  const $copyClipboardLat = getElement("#copy-clipboard-latitude");
  const $copyClipboardLng = getElement("#copy-clipboard-longitude");
  const $successToast = getElement("#success-toast");
  const $errorToast = getElement("#error-toast");
  const $errorToastBody = getElement(".toast-body.error");
  const $toastBody = getElement(".toast-body.success");

  // 디폴트 좌표(서울시청)
  const defaultPosition = {
    lat: 37.5663174209601,
    lng: 126.977829174031,
  };

  const defaultMapCenter = new kakao.maps.LatLng(
    defaultPosition.lat,
    defaultPosition.lng
  );
  const geocoder = new kakao.maps.services.Geocoder();

  const initMap = () => {
    // 지도 생성
    map = new kakao.maps.Map($mapContainer, {
      center: defaultMapCenter,
      level: 3,
    });

    // 마커 생성
    marker = new kakao.maps.Marker({
      position: map.getCenter(),
    });

    // 디폴트 마커 생성
    marker.setMap(map);

    // 마커 클릭 이벤트 등록
    kakao.maps.event.addListener(map, "click", handleClickMap);
  };

  const handleClickMap = (mouseEvent) => {
    const latLng = mouseEvent.latLng;
    // 주소 검색 인풋 초기화
    $inputAddress.value = "";

    // 클릭 마커 좌표 설정
    marker.setPosition(latLng);
    displayLocation(latLng.getLat(), latLng.getLng());
  };

  const searchAddress = (address) => {
    geocoder.addressSearch(address, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        // 검색 결과 지도 중앙
        map.setCenter(coords);
        // 검색 결과 좌표 설정
        marker.setPosition(coords);
        displayLocation(result[0].y, result[0].x);
      }
    });
  };

  const handleClickCopyClipboard = (text) => {
    if (text.length === 0) {
      $errorToastBody.innerHTML = "복사할 텍스트가 없습니다.";
      const toast = new bootstrap.Toast($errorToast);
      toast.show();
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        $toastBody.innerHTML = text + "<br /> 복사가 완료되었습니다.";
        const toast = new bootstrap.Toast($successToast);
        toast.show();
      })
      .catch((e) => {
        const toast = new bootstrap.Toast($errorToast);
        toast.show();
        console.error(e);
      });
  };

  const handleClickFindAddress = () => {
    new daum.Postcode({
      oncomplete: function (data) {
        $inputAddress.value = data.address;
        // 주소 장소 검색 함수 호출
        searchAddress(data.address);
      },
    }).open();
  };

  const displayLocation = (lat, lng) => {
    $searchResultLat.innerHTML = lat;
    $searchResultLng.innerHTML = lng;
  };

  function init() {
    // 클릭 이벤트 등록
    $inputAddress.addEventListener("click", handleClickFindAddress);
    $inputAddressButton.addEventListener("click", handleClickFindAddress);
    $copyClipboardLat.addEventListener("click", () =>
      handleClickCopyClipboard($searchResultLat.innerHTML)
    );
    $copyClipboardLng.addEventListener("click", () =>
      handleClickCopyClipboard($searchResultLng.innerHTML)
    );

    // 맵 실행
    initMap();

    // 디폴트 좌표 표기
    displayLocation(defaultPosition.lat, defaultPosition.lng);
  }

  init();
})();
