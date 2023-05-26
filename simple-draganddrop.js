// Listes des éléments déplacables
const draggables = document.querySelectorAll(".draggable");

const infosDraggable = { element: null };
let dragPrepare = false;


const callbacks_fn = { cb: (v1, v2) => { return false } };

const setCallback = function (f) {
    callbacks_fn.cb = f;
}

// Permet de positionner un élément en fonction de la souris et du reste
const setToPosition = (e, element) => {
    const mouseX = e.clientX || e.changedTouches[e.changedTouches.length - 1].pageX;
    const mouseY = e.clientY || e.changedTouches[e.changedTouches.length - 1].pageY;

    const dragareas = document.querySelectorAll('.dragarea');

    let dropzone;

    // On regare s'il faut placer automatiquement l'élément
    if (infosDraggable.element.getAttribute('autoplace') != null) {
        dropzone = [document.querySelector('.dragarea[zone="' + infosDraggable.element.getAttribute('zone') + '"]')];
    }
    else {
        // On regarde dans quel zone dropable on est
        dropzone = [...dragareas].filter(d => {
            const rect = d.getBoundingClientRect();
            return (Math.abs(mouseX - (rect.left + rect.width / 2)) < rect.width / 2 && Math.abs(mouseY - (rect.top + rect.height / 2)) < rect.height / 2);
        });
    }

    if (dropzone.length > 0 && infosDraggable.element.getAttribute('zone') == dropzone[0].getAttribute('zone')) {

        const dg = dropzone[0].querySelectorAll('.draggable:not(.moving)');

        if (dg.length == 0) {
            dropzone[0].appendChild(element);
        }
        else {
            let dist_min = 100000;
            let plus_proche = null;

            // On trouve l'item le plus proche
            [...dg].forEach(d => {
                const rect = d.getBoundingClientRect();
                let dist = (Math.sqrt(Math.pow(mouseX - (rect.left + rect.width / 2), 2) + Math.pow(mouseY - (rect.top + rect.height / 2), 2) * 2));
                if (dist < dist_min && Math.abs(mouseY - (rect.top + rect.height / 2)) < 50) {
                    dist_min = dist;
                    plus_proche = d;
                }
            });

            // On insert juste à coté
            if (plus_proche) {
                const rect = plus_proche.getBoundingClientRect();
                plus_proche.insertAdjacentElement((mouseX - (rect.left + rect.width / 2) < 0) ? 'beforebegin' : 'afterend', element)
            }
            else {
                dropzone[0].appendChild(element);
            }

        }
        return dropzone[0].getAttribute('value') || true;

    }
    else {
        return null;
    }

}

const drop = (e) => {
    if(dragPrepare) {
        dragPrepare = false;
    }
    else {
        const val = setToPosition(e, infosDraggable.element);
        infosDraggable.element.classList.remove('moving');
        document.querySelector('.preview').style.display = 'none';

        console.log(infosDraggable.element.getAttribute('value') + " -> " + val);
        callbacks_fn.cb(infosDraggable.element.getAttribute('value'), val);
    }


    infosDraggable.element = null;
    infosDraggable.parent.style.overflow = 'scroll';

}

let mX = 0;
let mY = 0;

const move = (e) => {

    if(dragPrepare) {
        dragPrepare = false;
        infosDraggable.element.classList.add('moving');
    }

    else if (infosDraggable.element) {

        let y = e.clientY || e.changedTouches[e.touches.length - 1].clientY;
        let x = e.clientX || e.changedTouches[e.touches.length - 1].clientX;

        infosDraggable.element.style.top = y + "px";
        infosDraggable.element.style.left = x + "px";

        if (setToPosition(e, document.querySelector('.preview'))) {
            document.querySelector('.preview').style.display = 'block';
        }
        else {
            document.querySelector('.preview').style.display = 'none';
        }
    }
}


draggables.forEach(i => {
    const take = (e) => {
        infosDraggable.parent = e.currentTarget.parentNode;
        infosDraggable.element = i;
        dragPrepare = true;

        infosDraggable.parent.style.overflow = 'hidden';
    }

    i.addEventListener('mousedown', e => take(e));
    i.addEventListener('touchstart', e => {
        if (infosDraggable.element == null)
            take(e)
        else e.preventDefault()
    });
});

window.addEventListener('mouseup', e => drop(e));
window.addEventListener('touchend', e => drop(e));

window.addEventListener('mousemove', e => move(e));
window.addEventListener('touchmove', e => move(e)); 