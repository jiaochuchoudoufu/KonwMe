var e=`sk-f887471d498e4762a82d1169b8433c9f`,t=`https://api.deepseek.com/v1/chat/completions`;async function n(n,r){try{let i=(await fetch(t,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${e}`},body:JSON.stringify({model:`deepseek-chat`,messages:n,stream:!0})})).body?.getReader(),a=new TextDecoder,o=``;for(;i;){let{done:e,value:t}=await i.read();if(e)break;let n=a.decode(t).split(`
`);for(let e of n)if(e.startsWith(`data: `)&&e!==`data: [DONE]`)try{let t=JSON.parse(e.slice(6)).choices[0]?.delta?.content||``;t&&(o+=t,r(t))}catch{}}return o}catch(e){return console.error(`AI 请求失败:`,e),r(`AI 服务暂时不可用，请稍后再试。`),`AI 服务暂时不可用，请稍后再试。`}}async function r(e,t){if(e.length===0){let e=`暂无消费记录，添加一些记录后我来帮你分析吧～`;return t(e),e}return n([{role:`system`,content:`你是一个专业的个人理财助手，帮助用户分析消费习惯。回复要简洁友好。`},{role:`user`,content:`
    请分析以下消费记录，给出：
    1. 消费概况（总支出、主要消费类别）
    2. 消费建议（哪些支出可以优化）
    3. 正能量鼓励
    
    消费记录：
    ${JSON.stringify(e,null,2)}
    `}],t)}async function i(e){return n([{role:`system`,content:`你是一个生活助手，回复要极其简短，每句话不超过15个字，总字数不超过80字。`},{role:`user`,content:`
当前天气情况：
- 城市：${e.city}
- 天气：${e.text}
- 温度：${e.temp}°C
- 湿度：${e.humidity}%
- 风速：${e.windSpeed} km/h

请给出：
1. 这种天气通常给人的感受
2. 对用户心情的可能影响
3. 1-2条改善心情或利用天气的建议

回复要温暖友好，有鼓励性。
`}],()=>{})}export{i as n,n as r,r as t};