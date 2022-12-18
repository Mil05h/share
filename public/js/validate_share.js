
const post_text = document.getElementById('post_text');
const share_btn = document.getElementById('share_btn');


post_text.addEventListener('change', (event) => { 
  const re = /^[.a-zA-Z0-9,!? ]*$/;
  if (event.target.value.length < 10 || event.target.value.length > 1000  || !re.test(event.target.value)){
    event.target.classList.add('is-invalid')
    event.target.classList.remove('is-valid')
  }else{
    event.target.classList.remove('is-invalid')
    event.target.classList.add('is-valid')
  }
})

share_btn.addEventListener('click', (event) => {
    if(post_text.classList.contains('is-invalid')){
      event.preventDefault()
      event.stopPropagation()
    }
})