const API_KEY = config.API_KEY
const DAYS= ["sun","mon","tues","wed","thu","fri","sat"]
const getCurrentWeatherData = async(city)=>{
    const response = await fetch("https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid="+API_KEY+"&units=metric")
    return response.json()
}


const getHourlyData =async (city)=>{
    const response = await fetch(`https:/api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
    const data = await response.json()
    // return response.json()
    return data.list.map(forecast=>{
        const {main:{temp,temp_max,temp_min},dt,dt_txt,weather:[{description,icon}]} = forecast;
        return {temp,temp_min,temp_max,dt,dt_txt,description,icon}
    })
}

const formatTemp =(temp)=>{
    return `${temp?.toFixed(1)}°C`
}

const createUrl= (icon)=> `http://openweathermap.org/img/wn/${icon}@2x.png`

const pushCurrentData =({name,main:{temp,temp_max,temp_min},weather:[{description}]})=>{
   const current=  document.querySelector("#current")
   current.querySelector(".city").textContent= name
   current.querySelector(".current-temp").textContent =formatTemp(temp)
   current.querySelector(".current-desc").textContent =description
   current.querySelector(".current-hl").textContent = `H:${formatTemp(temp_max)}/L:${formatTemp(temp_min)}`
}

const pushHourlyData =(data)=>{
    console.log(data)
    // let hourlyData =data.slice(1,13);
    let hourlyData =data;
    const hourlycontainer = document.querySelector(".hourly-items");
    let innerHtml=``;

   for(let {temp,icon,dt_txt} of hourlyData){
        innerHtml+= ` <article>
        <h2 class="hourly-time">${dt_txt.split(" ")[1]}</h2><hr>
        <img class="hourly-icon" alt="icon" src="${createUrl(icon)}">
        <p class="hourly-temp">${formatTemp(temp)}</p>
      </article>`
   }
   hourlycontainer.innerHTML =innerHtml
}

const pushFeelsLike=({main:{feels_like}})=>{
    const selector = document.querySelector("#feels-like")
    selector.querySelector(".feels-like-temp").textContent =formatTemp(feels_like)

}

const pushHumidity=({main:{humidity}})=>{
    const selector = document.querySelector("#humidity")
    selector.querySelector(".humidity-value").textContent =humidity+"%"

}

const calculateForecast = (info)=>{
    let daywiseFc =new Map()
    for (let i of info){
        const [date] =i.dt_txt.split(" ")
        const dayOfWeek = DAYS[new Date(date).getDay()]
        if (daywiseFc.has(dayOfWeek)){
            let fcDay=daywiseFc.get(dayOfWeek)
            fcDay.push(i)
            daywiseFc.set(dayOfWeek,fcDay)
        }
        else{
            daywiseFc.set(dayOfWeek,[i])
        }
    }
    for (let [key,value] of daywiseFc)
    {
        let minTemp= Math.min(...Array.from(value,val=>val.temp_min))
        let maxTemp= Math.max(...Array.from(value,val=>val.temp_max))
        daywiseFc.set(key,{temp_min:minTemp,temp_max:maxTemp,icon:value.find(v=>v.icon).icon})
    }
    return daywiseFc
}

const pushFiveDay = (info)=>{
    console.log(info)
    const daywise = calculateForecast(info)
    const container = document.querySelector(".five-days")
    let innerHTML=``
    Array.from(daywise).map(([day,{temp_max,temp_min,icon}],index)=>{
       
        innerHTML+=`<article class="days">
        <h2>${index===0? "Today":day}</h2>
        <img src="${createUrl(icon)}" alt="${icon}">
        <p class="five-min-temp">${formatTemp(temp_min)}</p>
        <p class="five-max-temp">${formatTemp(temp_max)}</p>
        </article>`

    })
    container.innerHTML =innerHTML
}


document.addEventListener("DOMContentLoaded",async()=>{
    const info = await getCurrentWeatherData("pokhara")
    pushCurrentData(info)
    const hourly = await getHourlyData("pokhara")
    pushHourlyData(hourly)
    pushFeelsLike(info)
    pushHumidity(info)
    pushFiveDay(hourly)
    const dropdown = document.querySelector("#cities");
    dropdown.addEventListener("change",async(event)=>{
        const ct=event.target.value
        const info = await getCurrentWeatherData(ct)
        pushCurrentData(info)
        const hourly = await getHourlyData(ct)
        pushHourlyData(hourly)
        pushFeelsLike(info)
        pushHumidity(info)
        pushFiveDay(hourly)
    })
})

