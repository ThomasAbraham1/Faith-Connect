import type { NavigateFunction } from "react-router"

let navigate: null | NavigateFunction = null

export function setNavigation(navFn: NavigateFunction){
    navigate = navFn
}

export function getNavigation(){
    return navigate
}