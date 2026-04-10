const API = "https://script.google.com/macros/s/AKfycbwjZ7TZXzdysJzK43aFfY7dd9kyId6qTU_qM1usTVglxRVEzOt9cgMBClo7ZNmMJAa9sA/exec";

const CACHE = {}

function fetchCached(url){
    if(CACHE[url]){
        return Promise.resolve(CACHE[url])
    }

    return fetch(url)
    .then(res=>res.json())
    .then(data=>{
        CACHE[url] = data
        return data
    })
}