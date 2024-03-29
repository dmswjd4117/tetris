import { User  } from "./type.js";

type Time = {
    start:number,
    elapsed:number,
    level:number
}


const user:User = { score: 0, lines: 0, level : 0};
const time:Time = { start: 0, elapsed: 0, level: 0};


const userProxy = new Proxy(user, {
    get : function(obj:User, prop:keyof User) {
        return obj[prop]
    },
    set : function(obj:User, prop:keyof User, value) {
        obj[prop] = value;
        if(prop !== 'lines'){
            const span = document.getElementById(prop);
            if(span){
                span.innerHTML = JSON.stringify(obj[prop]);
            }
        }
        return true;
    }
}) 

export { time, userProxy }