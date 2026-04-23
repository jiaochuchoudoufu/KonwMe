import type { Directive } from "vue";

export const touchFeedback: Directive = {
    mounted(el: HTMLElement) {
        el.addEventListener('touchstart', () => {
            el.style.opacity = '0.6'
        })
        el.addEventListener('touchend', () => {
            el.style.opacity = '1'
        })
        el.addEventListener('touchcancel', () => {
            el.style.opacity = '1'
        })
    }
}