/* eslint-disable no-await-in-loop */
/* eslint-disable for-direction */
// eslint-disable-next-line no-unused-vars
function initMap() {
  const geocoder = new google.maps.Geocoder();
  const directionsService = new google.maps.DirectionsService();
  const directionsDisplay = new google.maps.DirectionsRenderer();
  const service = new google.maps.DistanceMatrixService();

  const seattle = {
    lat: 47.6062,
    lng: -122.3321,
  };

  const map = new google.maps.Map(document.getElementById('map'), {
    center: seattle,
    zoom: 12,
    streetViewControl: false,
    mapTypeControl: false,
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      map.setCenter(pos);
    }, () => {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    handleLocationError(false, infoWindow, map.getCenter());
  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation
      ? 'Error: The Geolocation service failed.'
      : 'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  }

  const input = document.getElementById('address');
  const homeAddress = document.getElementById('homeAddress');
  const form = document.getElementById('taskAdder');
  const form2 = document.querySelector('.welcomeForm');
  const ul = document.querySelector('.tasks');
  const plannerButton = document.querySelector('.plannerButton');
  const err = document.querySelector('.errReport').querySelector('span');

  function newAutoComplete(item) {
    item.bindTo('bounds', map);
    item.setFields(
      ['address_components', 'geometry', 'icon', 'name'],
    );
  }

  const autocomplete = new google.maps.places.Autocomplete(input);
  newAutoComplete(autocomplete);

  const autocomplete2 = new google.maps.places.Autocomplete(homeAddress);
  newAutoComplete(autocomplete2);

  const autoCompletes = [autocomplete, autocomplete2];

  const infowindow = new google.maps.InfoWindow();
  const infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);
  const marker = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29),
  });

  autoCompletes.forEach(() => {
    autocomplete.addListener('place_changed', () => {
      infowindow.close();
      marker.setVisible(false);
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        input.value = '';
        return;
      }

      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
      }
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      let address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || ''),
        ].join(' ');
      }
      map.setZoom(12);

      input.placeholder = 'address';
    });
  });

  function calculateAndDisplayDirections(startPoint, endPoint) {
    const request = {
      origin: startPoint,
      destination: endPoint,
      travelMode: 'DRIVING',
    };
    directionsDisplay.setMap(map);
    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        directionsDisplay.setDirections(result);
      }
    });
  }

  function createItem(tag, text) {
    const item = document.createElement(tag);
    item.textContent = text;
    return item;
  }

  function createBr(item) {
    return item.appendChild(createItem('br'));
  }

  function createLI(name, address, noButtons) {
    const li = createItem('li');
    const mainDiv = createItem('div');
    const nameSpan = createItem('span', name);
    const addressTag = createItem('address', address);
    const optionsDiv = createItem('div');
    const toggleButton = createItem('button', '');
    const menuDiv = createItem('div');
    const editButton = createItem('button', 'edit');
    const removeButton = createItem('button', 'remove');

    optionsDiv.className = 'options';

    ul.appendChild(li);
    li.appendChild(mainDiv);
    mainDiv.appendChild(nameSpan);
    createBr(mainDiv);
    mainDiv.appendChild(addressTag);
    mainDiv.appendChild(optionsDiv);
    optionsDiv.appendChild(toggleButton);
    toggleButton.className = 'toggle';
    optionsDiv.appendChild(menuDiv);
    menuDiv.className = 'menu';
    menuDiv.classList.add('hidden');
    li.className = 'stop';
    menuDiv.appendChild(editButton);
    editButton.className = 'edit';
    menuDiv.appendChild(removeButton);
    removeButton.className = 'remove';
    if (noButtons === true) {
      optionsDiv.remove();
      li.className = 'home';
    }
    if (!address) {
      li.className = 'task';
      li.remove();
      ul.insertBefore(li, document.querySelector('.home'));
    } else {
      mainDiv.className = 'hasAddress';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name');
    let address;
    if (document.getElementById('address').value && !/^\s+$/.test(document.getElementById('address').value)) {
      address = document.getElementById('address').value;
    }
    if (name.value && !/^\s+$/.test(name.value)) {
      createLI(name.value, address);
      const stopNum = document.querySelectorAll('.stop').length;
      if (stopNum < 2) {
        plannerButton.textContent = `add ${2 - stopNum} more stops to plan day`;
      } else {
        plannerButton.textContent = 'plan tasks';
      }
    }
    name.value = '';
    document.getElementById('address').value = '';
  });

  form2.addEventListener('submit', (e) => {
    e.preventDefault();
  });

  ul.addEventListener('click', (e) => {
    const clicked = e.target;
    const action = clicked.textContent;
    if (clicked.className === 'toggle') {
      clicked.parentNode.querySelector('div').classList.toggle('hidden');
    } else {
      const buttons = {
        remove: () => {
          ul.removeChild(clicked.parentNode.parentNode.parentNode.parentNode);
        },
        edit: () => {
          const span = clicked.parentNode.parentNode.parentNode.firstElementChild;
          const input = document.createElement('input');
          input.type = 'text';
          input.value = span.textContent;
          clicked.parentNode.parentNode.parentNode.insertBefore(input, span);
          clicked.parentNode.parentNode.parentNode.removeChild(span);
          clicked.textContent = 'save';
        },
        save: () => {
          const span = document.createElement('span');
          const input = clicked.parentNode.parentNode.parentNode.firstElementChild;
          span.textContent = input.value;
          clicked.parentNode.parentNode.parentNode.insertBefore(span, input);
          clicked.parentNode.parentNode.parentNode.removeChild(input);
          clicked.textContent = 'edit';
        },
      };
      buttons[action]();
    }
  });

  err.parentNode.querySelector('button').addEventListener('click', (e) => {
    err.parentNode.style.top = ('-36px');
  });

  document.querySelector('.go').addEventListener('click', (e) => {
    const address = document.getElementById('homeAddress');
    if (address.value !== '') {
      createLI('Home Address', address.value, true);
      e.target.parentNode.parentNode.className = 'hidden';
    }
  });

  document.querySelector('.plannerButton').addEventListener('click', (e) => {
    const stopNum = document.querySelectorAll('.stop').length;
    if (stopNum >= 2) {
      setRoute();
    }
  });

  document.querySelector('.tasks').addEventListener('mouseover', (e) => {
    if (e.target.className === 'hasAddress' && e.target.parentNode.className !== 'home') {
      const hover = e.target.querySelector('ADDRESS').textContent;
      const previousAddress = e.target.parentNode.previousSibling.querySelector('ADDRESS').textContent;
      calculateAndDisplayDirections(hover, previousAddress);
    }
  });

  document.querySelector('ul').addEventListener('mouseout', () => {
    marker.setVisible(false);
    directionsDisplay.setMap(null);
  });

  function getDistance(address1, address2) {
    return new Promise((resolve, reject) => {
      const request = {
        origin: address1,
        destination: address2,
        travelMode: 'DRIVING',
      };
      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          resolve(Number(result.routes[0].legs[0].distance.text.replace(/[^\d.-]/g, '')));
        } else {
          reject(status); // add error messaging
        }
      });
    });
  }

  async function setRoute() {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    const lis = document.querySelectorAll('.stop');
    const stops = Array.prototype.slice.call(lis);
    const stopItems = Array.prototype.slice.call(lis);
    lis.forEach((i) => {
      i.remove();
    });
    for (let stopsIndex = 0; stopsIndex < stops.length; stopsIndex++) {
      const distances = [];
      for (let i = 0; i < stopItems.length; i++) {
        let lastLi = document.querySelectorAll('li');
        lastLi = lastLi[lastLi.length - 1];
        await delay(550);
        const newDis = await getDistance(lastLi.querySelector('address').innerText, stopItems[i].querySelector('address').innerText)
          .catch((result) => {
            err.innerText = `Problem with Google maps, results may vary. '${result}'`;
            err.parentNode.style.top = ('12px');
            return 100;
          });
        distances.push(newDis);
      }
      const lowest = distances.indexOf(Math.min(...distances));
      ul.appendChild(stopItems[lowest]);
      stopItems.splice(lowest, 1);
    }
  }
}
