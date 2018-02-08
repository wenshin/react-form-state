function getEventData(e) {
  const {
    type, checked,
    contentEditable
  } = e.target;
  let {name, value} = e.target;

  name = name || e.target.getAttribute('name');
  value = type === 'checkbox' ? checked : value;

  if (contentEditable === 'true') {
    value = e.target.innerHTML;
  }
  return {name, value};
}

export default {getEventData};
