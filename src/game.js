const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d');
let W,H,DPR,zone='street',t=0,cam=0,affection=2;
const quests=[{n:'夕焼けを眺める',done:true},{n:'喫茶店でお茶をする',done:false},{n:'公園で会う',done:false},{n:'あかりの好みを聞く',done:false}];
function resize(){DPR=Math.min(devicePixelRatio,2);W=canvas.clientWidth;H=canvas.clientHeight;canvas.width=W*DPR;canvas.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0)}addEventListener('resize',resize);resize();
function polygon(points,fill){ctx.fillStyle=fill;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill()}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
function circle(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function text(s,x,y,size,c,align='left'){ctx.font=`${size}px 'Noto Sans JP',sans-serif`;ctx.fillStyle=c;ctx.textAlign=align;ctx.fillText(s,x,y)}
function drawStreet(){
 const sky=ctx.createLinearGradient(0,0,0,H*.75);sky.addColorStop(0,'#7a718d');sky.addColorStop(.62,'#df9e9d');sky.addColorStop(1,'#f1c8a4');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 circle(W*.78,H*.28,48,'#ffdca8');circle(W*.78,H*.28,62,'rgba(255,220,168,.12)');
 polygon([[0,H*.62],[W,H*.62],[W,H],[0,H]],'#3a3843');polygon([[0,H*.62],[W*.46,H*.62],[W*.65,H],[0,H]],'#5a5660');
 // buildings
 for(let i=-1;i<7;i++){let x=i*W*.19+((cam*.08)%W*.19),bw=W*.16,bh=H*(.22+(i%3)*.04),y=H*.62-bh;ctx.save();ctx.translate((i%2)*8,0);rect(x,y,bw,bh,i%2?'#6c5863':'#4e4d5e');rect(x+6,y+bh*.12,bw-12,bh*.09,'#373542');for(let r=0;r<3;r++)for(let c=0;c<3;c++)rect(x+bw*.15+c*bw*.25,y+bh*.25+r*bh*.18,bw*.11,bh*.09,(r+c+i)%3?'#d7a494':'#9fa4a0');ctx.restore()}
 // lane marks
 for(let i=0;i<5;i++){let x=(i*180+(t*25)%180)-100;polygon([[x,H*.77],[x+55,H*.77],[x+130,H],[x+50,H]],'#d9bd9a')} 
 drawPerson(W*.57+Math.sin(t*.35)*12,H*.69,false);
 drawSakura(W*.14,H*.55);drawSakura(W*.88,H*.58);
}
function drawCafe(){
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#c49a91');g.addColorStop(.45,'#8e7371');g.addColorStop(1,'#55474e');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);rect(0,H*.62,W,H*.38,'#4a3c42');
 rect(W*.08,H*.12,W*.84,H*.5,'#2f2a30');rect(W*.10,H*.14,W*.80,H*.46,'#4b4143');
 // window
 rect(W*.18,H*.2,W*.64,H*.32,'#8d8e91');polygon([[W*.18,H*.52],[W*.82,H*.52],[W*.82,H*.35],[W*.18,H*.42]],'rgba(255,190,160,.18)');rect(W*.49,H*.2,W*.03,H*.32,'#3a3438');rect(W*.18,H*.34,W*.64,H*.025,'#3a3438');
 // counter & stools
 rect(W*.22,H*.67,W*.56,H*.09,'#33282d');rect(W*.25,H*.76,W*.05,H*.14,'#241f25');rect(W*.70,H*.76,W*.05,H*.14,'#241f25');
 rect(W*.27,H*.58,W*.46,H*.07,'#75545a');
 drawPerson(W*.51,H*.68,true);
 for(let i=0;i<3;i++){circle(W*(.28+i*.22),H*.57,18,'#c8ad90');circle(W*(.28+i*.22),H*.57,11,'#eee1d2')}
}
function drawPark(){
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#7b91a1');g.addColorStop(.55,'#a9bba5');g.addColorStop(1,'#586b56');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);polygon([[0,H*.58],[W,H*.58],[W,H],[0,H]],'#7c9a72');
 rect(W*.35,H*.31,W*.30,H*.27,'#b9a77e');rect(W*.38,H*.35,W*.24,H*.23,'#6c7d78');
 // bridge
 polygon([[W*.32,H*.72],[W*.68,H*.72],[W*.78,H*.82],[W*.22,H*.82]],'#d0b6a0');rect(W*.25,H*.65,W*.50,H*.07,'#9a6559');
 for(let i=0;i<7;i++){circle(W*(.05+i*.16),H*.47+(i%2)*20,60,'#4f7057')}drawSakura(W*.12,H*.38);drawSakura(W*.88,H*.35);
 drawPerson(W*.56,H*.69,false);
}
function drawApartment(){
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#a68b91');g.addColorStop(1,'#d0b0a7');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);rect(0,H*.68,W,H*.32,'#806a64');
 // room & window
 rect(W*.14,H*.12,W*.72,H*.56,'#dfc6bd');rect(W*.19,H*.18,W*.30,H*.38,'#899497');rect(W*.21,H*.20,W*.26,H*.34,'#f2b19d');rect(W*.34,H*.18,W*.02,H*.38,'#6a6668');rect(W*.19,H*.36,W*.30,H*.025,'#6a6668');
 // furniture
 rect(W*.55,H*.58,W*.28,H*.10,'#796168');rect(W*.58,H*.68,W*.05,H*.12,'#604f54');rect(W*.75,H*.68,W*.05,H*.12,'#604f54');rect(W*.18,H*.61,W*.22,H*.07,'#9a6d66');
 // Akari kneeling
 drawPerson(W*.53,H*.70,true);
 rect(W*.54,H*.54,W*.22,H*.09,'#eee1d7');text('♡',W*.70,H*.57,24,'#cc7e91','center');
}
function drawSakura(x,y){circle(x,y,70,'rgba(235,170,190,.78)');circle(x-45,y+10,38,'rgba(241,188,203,.9)');circle(x+40,y-15,45,'rgba(225,158,181,.9)');rect(x-5,y+55,10,H*.12,'#4b3b43')}
function drawPerson(x,y,cafe){let s=Math.min(W,H)/520;ctx.save();ctx.translate(x,y);ctx.scale(s,s);circle(0,-98,30,'#e9c2ad');polygon([[0,-68],[35,-6],[27,20],[-28,20],[-38,-6]],cafe?'#d89da7':'#b8a5c1');polygon([[-28,20],[-38,92],[ -8,92],[-4,20]],'#45434d');polygon([[4,20],[7,92],[38,92],[28,20]],'#45434d');
 ctx.fillStyle='#2c2630';ctx.beginPath();ctx.arc(0,-102,32,Math.PI*.05,Math.PI*.95,true);ctx.lineTo(28,-75);ctx.quadraticCurveTo(-10,-90,-28,-75);ctx.fill();ctx.fillStyle='#1e1b22';ctx.beginPath();ctx.arc(-31,-98,22,0,Math.PI*2);ctx.arc(31,-98,22,0,Math.PI*2);ctx.fill();circle(-10,-100,2,'#5a4148');circle(10,-100,2,'#5a4148');ctx.restore()}
function render(){t+=.016;ctx.clearRect(0,0,W,H);if(zone==='street')drawStreet();else if(zone==='cafe')drawCafe();else if(zone==='park')drawPark();else drawApartment();requestAnimationFrame(render)}render();
function renderUI(){document.getElementById('heartText').textContent=`${affection} / 5`;document.querySelector('.hearts').innerHTML=Array.from({length:5},(_,i)=>`<i class="${i>=affection?'off':''}"></i>`).join('');document.getElementById('quests').innerHTML=quests.map(q=>`<li class="quest ${q.done?'done':''}">${q.n}</li>`).join('')}
renderUI();
const dialogues={street:['あかり','今日はいい夕焼けね。少しだけ一緒に散歩しない？'],cafe:['あかり','この喉が鳴るようなコーヒー、お気に入りなの。好きな席を選んで。'],park:['あかり','静かな公園だね。ここならゆっくり話せそう。'],apartment:['あかり','おかえり。今日はお茶を淹れようかな。']};
function talk(){const [s,tx]=dialogues[zone];document.getElementById('speaker').textContent=s;document.getElementById('text').textContent=tx;const choices=zone==='street'?['散歩を提案する','今日の予定を聞く','帰る']:['もっと話す','一緒に過ごす','次の場所へ'];document.getElementById('choices').innerHTML=choices.map((c,i)=>`<button data-i="${i}">${c}</button>`).join('');document.getElementById('dialogue').classList.remove('hidden')}
talk();
function toast(s){const e=document.getElementById('toast');e.textContent=s;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1600)}
document.querySelectorAll('#locations button').forEach(b=>b.onclick=()=>{zone=b.dataset.zone;document.querySelectorAll('#locations button').forEach(x=>x.classList.remove('active'));b.classList.add('active');cam=0;talk();const qi={street:0,cafe:1,park:2,apartment:3}[zone];if(qi>0&&!quests[qi].done){quests[qi].done=true;affection=Math.min(5,affection+1);renderUI();toast(zone==='cafe'?'クエスト達成：喫茶店でお茶':zone==='park'?'クエスト達成：公園で会う':'クエスト達成：好みを聞く')}});
document.getElementById('choices').onclick=e=>{if(e.target.tagName!=='BUTTON')return;const i=+e.target.dataset.i;if(i===0||i===1){affection=Math.min(5,affection+(i===0?1:0));renderUI();toast(i===0?'心の距離が近づいた':'話を聞いているうちに…');setTimeout(()=>document.getElementById('dialogue').classList.add('hidden'),900)}else{document.querySelector('[data-zone="park"]').click()}};
document.getElementById('left').onclick=()=>cam-=40;document.getElementById('right').onclick=()=>cam+=40;