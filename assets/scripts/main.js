document.addEventListener("DOMContentLoaded",()=>{
  fetch("data/audits.json").then(r=>r.json()).then(audits=>{
    // ---- Stats ----
    const total=audits.length;
    const verified=audits.filter(a=>a.status==="Verified").length;
    const inAudit=audits.filter(a=>a.status==="In Audit").length;
    const avg=(audits.filter(a=>a.confidence).reduce((x,y)=>x+y.confidence,0)/verified||0).toFixed(2);

    const options={duration:2.5,separator:","};
    new CountUp("totalAudits",total,options).start();
    new CountUp("verifiedAudits",verified,options).start();
    new CountUp("inAudit",inAudit,options).start();
    new CountUp("avgScore",avg,options).start();

    // ---- Ticker ----
    const now=audits.filter(a=>a.status!=="Verified").map(a=>a.project).join(" • ");
    const done=audits.filter(a=>a.status==="Verified").map(a=>a.project).join(" • ");
    document.getElementById("ticker").innerHTML=`🔍 Now Auditing: ${now} &nbsp;&nbsp;✅ Recently Verified: ${done}`;
  });
});
