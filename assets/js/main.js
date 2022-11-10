const API_KEY = "e587487016ae74ac3b861c191a2ded25"
const getCurrentWeatherData = async(city)=>{
    const response = await fetch("https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid="+API_KEY+"&units=metric")
    return response.json()
}

const formatTemp =(temp)=>{
    return `${temp?.toFixed(1)}°`
}
const pushData =({name,main:{temp,temp_max,temp_min},weather:[{description}]})=>{
   const current=  document.querySelector("#current")
   current.querySelector(".city").textContent= name
   current.querySelector(".current-temp").textContent =formatTemp(temp)
   current.querySelector(".current-desc").textContent =description
   current.querySelector(".current-hl").textContent = `H:${formatTemp(temp_max)}/L:${formatTemp(temp_min)}`
}

document.addEventListener("DOMContentLoaded",async()=>{
    // console.log(await getCurrentWeatherData("pokhara"))
    const info = await getCurrentWeatherData("pokhara")
    pushData(info)

})