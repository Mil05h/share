const share = document.querySelectorAll('.share')

let num = 10;


window.addEventListener('load', (event) => {
    for (let i = 0; i < share.length; i++) {
        if (i > num) {
            share[i].hidden = true;
        }
    }
});


window.onscroll = function (ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        // you're at the bottom of the page
        num = num + 10;
        for (let i = 0; i < share.length; i++) {
            if (i < num) {
                share[i].hidden = false;
            }
        }
    }
};