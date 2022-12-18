const search_div = document.querySelector('.search_div')
const search_anchor = document.querySelector('#search_anchor')
const search_input = document.querySelector('.search_input')
const search_form = document.querySelector('#search_form')
const date = document.querySelector('#date')
const anch = document.querySelector('#anch')
const date_form = document.querySelector('#date_form')

search_form.addEventListener('submit', (event) => {
    search_form.action = `/${search_input.value}/comment`
})

date.addEventListener('change', (event) => {
  date_form.submit();
})

anch.addEventListener('click', (event) => {
  date.showPicker();
})

search_div.addEventListener('mouseover', (event) => {
  search_input.hidden = false;
  search_anchor.hidden = true;
})

search_div.addEventListener('mouseout', (event) => {
  if (search_input === document.activeElement) {
    search_input.hidden = false;
    search_anchor.hidden = true;
  }
  else {
    search_input.hidden = true;
    search_anchor.hidden = false;
  }
})

window.addEventListener('click', function (e) {
  if (search_input.contains(e.target)) {
    search_input.hidden = false;
    search_anchor.hidden = true;
  }
  else {
    search_input.hidden = true;
    search_anchor.hidden = false;
  }
});

// window.addEventListener('load', (e) => {
//   if (path.length.contains(''))
// })