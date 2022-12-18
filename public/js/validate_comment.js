
const comment_text = document.getElementById('comment_text');
const comment_btn = document.getElementById('comment_btn');


comment_text.addEventListener('change', (event) => { 
  const re = /^[.a-zA-Z0-9,!? ]*$/;
  if (event.target.value.length < 5 || event.target.value.length > 1000  || !re.test(event.target.value)){
    event.target.classList.add('is-invalid')
    event.target.classList.remove('is-valid')
  }else{
    event.target.classList.remove('is-invalid')
    event.target.classList.add('is-valid')
  }
})

comment_btn.addEventListener('click', (event) => {
    if(comment_text.classList.contains('is-invalid')){
      event.preventDefault()
      event.stopPropagation()
    }
})