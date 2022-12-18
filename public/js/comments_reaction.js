const approve_buttons_com = document.querySelectorAll('.approve_com')
const condemn_buttons_com = document.querySelectorAll('.condemn_com')
const approve_count_com = document.querySelectorAll('.approve_count_com')
const condemn_count_com = document.querySelectorAll('.condemn_count_com')


for (let i = 0; i < approve_buttons_com.length; i++) {
    approve_buttons_com[i].addEventListener('click', (event) => {
        approved_com(approve_buttons_com[i].id)
        approve_count_com[i].innerText = parseInt(approve_count_com[i].innerText) + 1;
        approve_buttons_com[i].disabled = 'true';
        approve_buttons_com[i].style.color = 'green';
        condemn_buttons_com[i].disabled = 'true';
        condemn_buttons_com[i].style.color = 'gray';
    })
}

for (let i = 0; i < condemn_buttons_com.length; i++) {
    condemn_buttons_com[i].addEventListener('click', (event) => {
        condemned_com(condemn_buttons_com[i].id)
        condemn_count_com[i].innerText = parseInt(condemn_count_com[i].innerText) + 1;
        condemn_buttons_com[i].disabled = 'true';
        condemn_buttons_com[i].style.color = 'red';
        approve_buttons_com[i].disabled = 'true';
        approve_buttons_com[i].style.color = 'gray';
    })
}

async function approved_com(comment_id) {
    if (cookie_2 === 'none' || cookie_2.items.includes(comment_id.toString() + 'a') === false && cookie_2.items.includes(comment_id.toString()) === false) {
        const res = await axios({
            method: 'post',
            url: `/28approve04/${comment_id}/comment`,
        });
    }
}

async function condemned_com(comment_id) {
    if (cookie_2 === 'none' || cookie_2.items.includes(comment_id.toString() + 'a') === false && cookie_2.items.includes(comment_id.toString()) === false) {
        const res = await axios({
            method: 'post',
            url: `/28condemn04/${comment_id}/comment`,
        });
    }
}


window.addEventListener('load', (event) => {
    if (cookie_2 !== 'none') {
        for (let i = 0; i < approve_buttons_com.length; i++) {
            if (cookie_2.items.includes(approve_buttons_com[i].id + 'a') || cookie_2.items.includes(approve_buttons_com[i].id)) {
                approve_buttons_com[i].disabled = 'true';
                condemn_buttons_com[i].disabled = 'true';
                if (cookie_2.items.includes(approve_buttons_com[i].id + 'a')) {
                    approve_buttons_com[i].style.color = 'green';
                    condemn_buttons_com[i].style.color = 'gray';
                } else {
                    condemn_buttons_com[i].style.color = 'red';
                    approve_buttons_com[i].style.color = 'gray';
                }
            }
        }
    }
})