import{F as e,c as t}from"./element-plus-C747c1Zh.js";import{o as n}from"./vue-vendor-4Yhx5rY7.js";var r=n(`ledger`,()=>{let n=e([]),r=t(()=>n.value.filter(e=>e.type===`income`).reduce((e,t)=>e+t.amount,0)),i=t(()=>n.value.filter(e=>e.type===`expense`).reduce((e,t)=>e+t.amount,0)),a=t(()=>r.value-i.value);function o(){localStorage.setItem(`ledger_records`,JSON.stringify(n.value))}function s(e){let t=n.value.length>0?Math.max(...n.value.map(e=>e.id))+1:1;n.value.push({...e,id:t}),o()}function c(e,t){let r=n.value.findIndex(t=>t.id===e);r!==-1&&(n.value[r]={...t,id:e},o())}function l(e){let t=n.value.findIndex(t=>t.id===e);t!==-1&&(n.value.splice(t,1),o())}function u(){let e=localStorage.getItem(`ledger_records`);e?n.value=JSON.parse(e):n.value=[{id:1,type:`income`,amount:5e3,category:`工资`,date:`2024-04-01`,note:`4月工资(示例数据可删除）`},{id:2,type:`expense`,amount:68,category:`餐饮`,date:`2024-04-02`,note:`火锅(示例数据可删除）`},{id:3,type:`expense`,amount:1200,category:`房租`,date:`2024-04-01`,note:`4月房租(示例数据可删除）`}]}return u(),{records:n,totalIncome:r,totalExpense:i,balance:a,addRecord:s,updateRecord:c,deleteRecord:l}}),i=`sk-f887471d498e4762a82d1169b8433c9f`,a=`https://api.deepseek.com/v1/chat/completions`;async function o(e,t){try{let n=(await fetch(a,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${i}`},body:JSON.stringify({model:`deepseek-chat`,messages:e,stream:!0})})).body?.getReader(),r=new TextDecoder,o=``;for(;n;){let{done:e,value:i}=await n.read();if(e)break;let a=r.decode(i).split(`
`);for(let e of a)if(e.startsWith(`data: `)&&e!==`data: [DONE]`)try{let n=JSON.parse(e.slice(6)).choices[0]?.delta?.content||``;n&&(o+=n,t(n))}catch{}}return o}catch(e){return console.error(`AI 请求失败:`,e),t(`AI 服务暂时不可用，请稍后再试。`),`AI 服务暂时不可用，请稍后再试。`}}async function s(e,t){if(e.length===0){let e=`暂无消费记录，添加一些记录后我来帮你分析吧～`;return t(e),e}return o([{role:`system`,content:`你是一个专业的个人理财助手，帮助用户分析消费习惯。回复要简洁友好。`},{role:`user`,content:`
    请分析以下消费记录，给出：
    1. 消费概况（总支出、主要消费类别）
    2. 消费建议（哪些支出可以优化）
    3. 正能量鼓励
    
    消费记录：
    ${JSON.stringify(e,null,2)}
    `}],t)}async function c(e){return o([{role:`system`,content:`你是一个生活助手，回复要极其简短，每句话不超过15个字，总字数不超过80字。`},{role:`user`,content:`
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
`}],()=>{})}export{r as i,c as n,o as r,s as t};