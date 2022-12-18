const approve_buttons = document.querySelectorAll('.approve')
const condemn_buttons = document.querySelectorAll('.condemn')
const approve_count = document.querySelectorAll('.approve_count')
const condemn_count = document.querySelectorAll('.condemn_count')


for (let i = 0; i < approve_buttons.length; i++) {
    approve_buttons[i].addEventListener('click', (event) => {
        approved(approve_buttons[i].id)
        approve_count[i].innerText = parseInt(approve_count[i].innerText) + 1;
        approve_buttons[i].disabled = 'true';
        approve_buttons[i].style.color = 'green';
        condemn_buttons[i].disabled = 'true';
        condemn_buttons[i].style.color = 'gray';
    })
}

for (let i = 0; i < condemn_buttons.length; i++) {
    condemn_buttons[i].addEventListener('click', (event) => {
        condemned(condemn_buttons[i].id)
        condemn_count[i].innerText = parseInt(condemn_count[i].innerText) + 1;
        condemn_buttons[i].disabled = 'true';
        condemn_buttons[i].style.color = 'red';
        approve_buttons[i].disabled = 'true';
        approve_buttons[i].style.color = 'gray';
    })
}

async function approved(post_id) {
    if (cookie_1 === 'none' || cookie_1.items.includes(post_id.toString() + 'a') === false && cookie_1.items.includes(post_id.toString()) === false) {
        const res = await axios({
            method: 'post',
            url: `/28approve04/${post_id}/post`,
        });
    }
}

async function condemned(post_id) {
    if (cookie_1 === 'none' || cookie_1.items.includes(post_id.toString() + 'a') === false && cookie_1.items.includes(post_id.toString()) === false) {
        const res = await axios({
            method: 'post',
            url: `/28condemn04/${post_id}/post`,
        });
    }
}


window.addEventListener('load', (event) => {
    if (cookie_1 !== 'none') {
        for (let i = 0; i < approve_buttons.length; i++) {
            if (cookie_1.items.includes(approve_buttons[i].id + 'a') || cookie_1.items.includes(approve_buttons[i].id)) {
                approve_buttons[i].disabled = true;
                condemn_buttons[i].disabled = true;
                if (cookie_1.items.includes(approve_buttons[i].id + 'a')) {
                    approve_buttons[i].style.color = 'green';
                    condemn_buttons[i].style.color = 'gray';
                } else {
                    approve_buttons[i].style.color = 'gray';
                    condemn_buttons[i].style.color = 'red';
                }
            }
        }
    }
})