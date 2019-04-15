document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('taskAdder');
  const ul = document.querySelector('.tasks');
  const plannerButton = document.querySelector('.plannerButton');
 
  
  function addClass() {
    const stops = document.querySelectorAll('.stop');
    stops.forEach((element) => {
      element.classList.add('sorted');
    });
  }

  function removeClass() {
    const sorted = document.querySelectorAll('.sorted');
    sorted.forEach((element) => {
      element.classList.remove('sorted');
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
    const buttonDiv = createItem('div');
    const editButton = createItem('button', 'edit');
    const completeButton = createItem('button', 'complete');
    const removeButton = createItem('button', 'remove');

    buttonDiv.className = 'buttons';

    ul.appendChild(li);
    li.appendChild(mainDiv);
    mainDiv.appendChild(nameSpan);
    createBr(mainDiv);
    mainDiv.appendChild(addressTag);
    mainDiv.appendChild(buttonDiv);
    mainDiv.className = 'stop';
    buttonDiv.appendChild(editButton);
    buttonDiv.appendChild(completeButton);
    buttonDiv.appendChild(removeButton);
    if (noButtons === true) {
      buttonDiv.remove();
      mainDiv.className = 'home';
    }
    if (!address) {
      mainDiv.className = 'task';
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
      const liNum = document.querySelectorAll('.stop').length;
      if (liNum < 3) {
        plannerButton.textContent = `add ${3 - liNum} more stops to plan day`;
      } else {
        plannerButton.textContent = 'plan the day';
      }
    }
    name.value = '';
    document.getElementById('address').value = '';
  });

  ul.addEventListener('click', (e) => {
    const clicked = e.target;
    const action = clicked.textContent;
    const buttons = {
      remove: () => {
        console.log('clicked');
        ul.removeChild(clicked.parentNode.parentNode.parentNode);
      },
      edit: () => {
        const span = clicked.parentNode.parentNode.firstElementChild;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.textContent;
        clicked.parentNode.parentNode.insertBefore(input, span);
        clicked.parentNode.parentNode.removeChild(span);
        clicked.textContent = 'save';
      },
      save: () => {
        const span = document.createElement('span');
        const input = clicked.parentNode.parentNode.firstElementChild;
        span.textContent = input.value;
        clicked.parentNode.parentNode.insertBefore(span, input);
        clicked.parentNode.parentNode.removeChild(input);
        clicked.textContent = 'edit';
      },
      completed: () => {
        // eventual code
      },
    };
    buttons[action]();
  });

  document.querySelector('.go').addEventListener('click', (e) => {
    const address = document.getElementById('homeAddress');
    if (address.value !== '') {
      createLI('Home Address', address.value, true);
      e.target.parentNode.className = 'hidden';
    }
  });
});
