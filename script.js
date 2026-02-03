async function atualizarPlayers(){
    try{
        const res = await fetch("http://localhost:3000/status");
        const data = await res.json();
        document.getElementById("players").innerText =
            `Jogadores Online: ${data.players}/${data.max}`;
    }catch{
        document.getElementById("players").innerText = "Servidor offline";
        document.getElementById("serverstatus").innerText = "🔴 Offline";
    }
}

function entrar(){
    alert("IP do servidor: 123.456.789.000:7777");
}

setInterval(atualizarPlayers,3000);
atualizarPlayers();

const elementos = document.querySelectorAll(".box, .info, .status");

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.style.opacity = 1;
            entry.target.style.transform = "translateY(0)";
        }
    });
});

elementos.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = "translateY(60px)";
    el.style.transition = "1s";
    observer.observe(el);
});

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for(let i=0;i<80;i++){
    particles.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        r: Math.random()*2+1,
        dx: Math.random()*.5,
        dy: Math.random()*.5
    });
}

function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    particles.forEach(p=>{
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle="rgba(90,255,122,.5)";
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if(p.x>canvas.width) p.x=0;
        if(p.y>canvas.height) p.y=0;
    });

    requestAnimationFrame(animate);
}

animate();

window.onresize = ()=>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

let currentSlide = 0;
const slides = document.getElementById("slides");
const totalSlides = slides.children.length;

function showSlide(index){
    if(index < 0) currentSlide = totalSlides - 1;
    else if(index >= totalSlides) currentSlide = 0;
    else currentSlide = index;

    slides.style.transform = `translateX(-${currentSlide * 100}vw)`;
}

function nextSlide(){
    showSlide(currentSlide + 1);
    resetAutoSlide();
}

function prevSlide(){
    showSlide(currentSlide - 1);
    resetAutoSlide();
}

/* Auto play */
let autoSlide = setInterval(() => {
    nextSlide();
}, 5000);

function resetAutoSlide(){
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
        nextSlide();
    }, 5000);
}

function scrollToSection(id){
    const section = document.getElementById(id);
    if(section){
        section.scrollIntoView({ behavior: "smooth" });
    }
}
function copiarIP(){
    const input = document.getElementById("server-ip");
    input.select();
    input.setSelectionRange(0, 99999); // Android
    document.execCommand("copy");
    alert("IP copiado!");
}

async function carregarRanking(){
    try{
        const res = await fetch("http://localhost:3000/ranking");
        const data = await res.json();

        /* ========= TOP 3 ========= */
        const cards = document.querySelectorAll(".top-card");

        data.slice(0, 3).forEach((player, index) => {
            if(cards[index]){
                cards[index].querySelector(".name").textContent = player.name;
                cards[index].querySelector(".points").textContent =
                    player.score + " pts";
            }
        });

        /* ========= TABELA ========= */
        const tbody = document.getElementById("ranking-body");
        tbody.innerHTML = "";

        data.forEach((player, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.score}</td>
            `;
            tbody.appendChild(tr);
        });

    }catch{
        document.getElementById("ranking-body").innerHTML =
            "<tr><td colspan='3'>Erro ao carregar ranking</td></tr>";
    }
}
