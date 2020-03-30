const type = (target, type) => {
    if(typeof target == "string"){
        if(typeof target != type) throw `invalid type ${target} : ${type}`;
    } else if(!(target instanceof type)) throw `invalid type ${target} : ${type}`
    return target; 
}

const sel = (target) => document.querySelector(target);

const el = (target, ...attr) => {
    const el = typeof target == "string" ? document.createElement(target) : target;
    for(let i = 0; i < attr.length;){
        const key = attr[i++];
        const value = attr[i++];
        if(typeof el[key] == "function") {
            el[key](...(Array.isArray(value) ? value : [value]));
        } else if(key[0] == "@") el.style[key.substr(1)] = value
        else el[key] = value;
        return el;
    }
}