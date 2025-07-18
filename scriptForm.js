const estadosSelect = document.getElementById("estado");
const cidadesSelect = document.getElementById("cidade");
const lojasSelect = document.getElementById("loja");
const enderecoInput = document.getElementById("endereco");
const listaVendedores = document.getElementById("listaVendedores");
const vendedoresContainer = document.getElementById("vendedoresContainer");
const codigoGerado = document.getElementById("codigoGerado");

const selectNovoEstado = document.getElementById("selectNovoEstado");
const novaCidadeInput = document.getElementById("novaCidade");
const nomeLojaInput = document.getElementById("nomeLoja");

const btnNovaCidade = document.getElementById("btnNovaCidade");
const btnNovaLoja = document.getElementById("btnNovaLoja");
const btnNovoEstado = document.getElementById("btnNovoEstado");

const btnSalvarEstado = document.getElementById("btnSalvarEstado");
const btnSalvarCidade = document.getElementById("btnSalvarCidade");
const btnSalvarLoja = document.getElementById("btnSalvarLoja");

const btnAddVendedor = document.getElementById("addVendedor");
const btnDownload = document.getElementById("btnDownload");
const formLoja = document.getElementById("formLoja");

const btnCopiarCodigo = document.getElementById("btnCopiarCodigo");

const btnResetarFormulario = document.getElementById("btnResetarFormulario");



const todosEstadosBrasil = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo",
  "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná",
  "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul",
  "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"
];

function carregarEstadosDisponiveis() {
  const cadastrados = dadosBrasil.estados.map(e => e.nome);
  const disponiveis = todosEstadosBrasil.filter(nome => !cadastrados.includes(nome));

  selectNovoEstado.innerHTML = '<option value="">Selecione um novo estado</option>';
  disponiveis.forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    selectNovoEstado.appendChild(opt);
  });
}

function confirmarExclusao(callback) {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50";

  const modal = document.createElement("div");
  modal.className = "bg-white p-6 rounded-xl shadow-xl text-center space-y-4 max-w-sm w-full";
  modal.innerHTML = `
    <p class="text-lg text-gray-800 font-semibold">Tem certeza que deseja excluir este vendedor?</p>
    <div class="flex justify-center gap-4">
      <button class="btn-confirm-ok bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold">✔️ Confirmar</button>
      <button class="btn-confirm-cancel bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold">❌ Cancelar</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  modal.querySelector(".btn-confirm-ok").onclick = () => {
    document.body.removeChild(overlay);
    callback(true);
  };

  modal.querySelector(".btn-confirm-cancel").onclick = () => {
    document.body.removeChild(overlay);
    callback(false);
  };
}

function criarCardVendedor(v, loja, index = null) {
  const div = document.createElement("div");
  div.className = "border p-2 rounded flex flex-col md:flex-row md:items-center md:justify-between gap-2";
  div.innerHTML = `
    <div class="info">
      <strong>${v.nome}</strong><br/>
      Tel: ${v.numero}<br/>
      Email: ${v.email || '-'}<br/>
      Cargo: ${v.cargo || '-'}
    </div>
    <div class="editavel hidden flex-col gap-1">
      <input type="text" class="edit-nome border px-2 py-1 rounded" value="${v.nome}" placeholder="Nome">
      <input type="text" class="edit-numero border px-2 py-1 rounded" value="${v.numero}" placeholder="Telefone">
      <input type="text" class="edit-email border px-2 py-1 rounded" value="${v.email || ''}" placeholder="Email (apenas nome.sorbenome)">
      <select class="edit-cargo border px-2 py-1 rounded">
        <option value="">Cargo</option>
        <option value="Consultor de Vendas" ${v.cargo === "Consultor de Vendas" ? "selected" : ""}>Consultor de Vendas</option>
        <option value="Supervisor de Vendas" ${v.cargo === "Supervisor de Vendas" ? "selected" : ""}>Supervisor de Vendas</option>
      </select>
      <button class="salvar bg-green-500 hover:bg-green-600 text-white font-semibold px-2 py-1 rounded mt-1">Salvar</button>
    </div>
    <div class="space-x-2">
      <button type="button" class="editar bg-yellow-300 hover:bg-yellow-400 text-black font-semibold px-2 py-1 rounded">✏️</button>
      <button type="button" class="excluir bg-red-500 hover:bg-red-600 text-white font-semibold px-2 py-1 rounded">❌</button>
    </div>
  `;

  const infoDiv = div.querySelector(".info");
  const editDiv = div.querySelector(".editavel");
  const editarBtn = div.querySelector(".editar");
  const excluirBtn = div.querySelector(".excluir");
  const salvarBtn = div.querySelector(".salvar");

  editarBtn.onclick = () => {
    infoDiv.classList.add("hidden");
    editDiv.classList.remove("hidden");
    editDiv.classList.add("flex");
  };

salvarBtn.onclick = () => {
  const nome = div.querySelector(".edit-nome").value.trim();
  const numero = div.querySelector(".edit-numero").value.trim();
  let email = div.querySelector(".edit-email").value.trim();
  const cargo = div.querySelector(".edit-cargo").value;

  if (!nome || !numero || !email || !cargo) {
    alert("Todos os campos são obrigatórios.");
    return;
  }

  // Se não tiver @, adiciona domínio da empresa
  if (!email.includes("@")) {
    email = `${email}@tecar.com.br`;
  }

  v.nome = nome;
  v.numero = numero;
  v.email = email;
  v.cargo = cargo;

  carregarLoja(loja.nome);
  atualizarCodigoGerado();
};



  excluirBtn.onclick = () => {
    confirmarExclusao((confirmado) => {
      if (confirmado) {
        const i = index !== null ? index : loja.vendedores.indexOf(v);
        if (i !== -1) loja.vendedores.splice(i, 1);
        carregarLoja(loja.nome);
        atualizarCodigoGerado();
      }
    });
  };

  return div;
}



btnAddVendedor.addEventListener("click", () => {
  const estado = dadosBrasil.estados.find(e => e.nome === estadosSelect.value);
  const cidade = estado?.cidades.find(c => c.nome === cidadesSelect.value);
  const loja = cidade?.lojas.find(l => l.nome === lojasSelect.value);
  if (!loja) return alert("Selecione uma loja antes de adicionar um vendedor.");

  const novo = { nome: "", numero: "", email: "", cargo: "" };
  loja.vendedores.push(novo); // ⬅ agora adiciona no dado real

  const card = criarCardVendedor(novo, loja);
  card.querySelector(".info").classList.add("hidden");
  card.querySelector(".editavel").classList.remove("hidden");
  card.querySelector(".editavel").classList.add("flex");
  vendedoresContainer.appendChild(card);
});


btnCopiarCodigo.addEventListener("click", () => {
  const codigo = codigoGerado.textContent;
  navigator.clipboard.writeText(codigo).then(() => {
    btnCopiarCodigo.textContent = "✅ Copiado!";
    setTimeout(() => {
      btnCopiarCodigo.textContent = "📋 Copiar Código";
    }, 2000);
  }).catch(() => {
    alert("Falha ao copiar o código.");
  });
});


formLoja.addEventListener("submit", (e) => {
  e.preventDefault();
  const estado = dadosBrasil.estados.find(e => e.nome === estadosSelect.value);
  const cidade = estado?.cidades.find(c => c.nome === cidadesSelect.value);
  const loja = cidade?.lojas.find(l => l.nome === lojasSelect.value);
  if (!loja) return alert("Loja não encontrada para adicionar vendedores.");

  const novos = vendedoresContainer.querySelectorAll(".editavel");
  novos.forEach(div => {
    const nome = div.querySelector(".edit-nome").value.trim();
    const numero = div.querySelector(".edit-numero").value.trim();
    const email = div.querySelector(".edit-email").value.trim();
    const cargo = div.querySelector(".edit-cargo").value;
    if (nome && numero && email && cargo) {
      loja.vendedores.push({ nome, numero, email, cargo });
    }
  });

  vendedoresContainer.innerHTML = "";
  carregarLoja(loja.nome);
  atualizarCodigoGerado();
});

function atualizarCodigoGerado() {
  const jsCode = `const dadosBrasil = ${JSON.stringify(dadosBrasil, null, 2)};`;
  codigoGerado.textContent = jsCode;
  const blob = new Blob([jsCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  btnDownload.href = url;
  btnDownload.download = "dados.js";
  btnDownload.classList.remove("hidden");
  btnCopiarCodigo.classList.remove("hidden");
}

function carregarEstados() {
  estadosSelect.innerHTML = `<option value="">Selecione o estado</option>`;
  dadosBrasil.estados.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.nome;
    opt.textContent = e.nome;
    estadosSelect.appendChild(opt);
  });
}

function carregarCidades(estadoNome) {
  cidadesSelect.innerHTML = `<option value="">Selecione a cidade</option>`;
  lojasSelect.innerHTML = "";
  enderecoInput.value = "";
  listaVendedores.innerHTML = "";
  const estado = dadosBrasil.estados.find(e => e.nome === estadoNome);
  if (!estado) return;
  estado.cidades.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.nome;
    opt.textContent = c.nome;
    cidadesSelect.appendChild(opt);
  });
}

function carregarLojas(cidadeNome) {
  lojasSelect.innerHTML = `<option value="">Selecione a loja</option>`;
  enderecoInput.value = "";
  listaVendedores.innerHTML = "";
  const estado = dadosBrasil.estados.find(e => e.nome === estadosSelect.value);
  const cidade = estado?.cidades.find(c => c.nome === cidadeNome);
  if (!cidade) return;
  cidade.lojas.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l.nome;
    opt.textContent = l.nome;
    lojasSelect.appendChild(opt);
  });
}

function carregarLoja(lojaNome) {
  const estado = dadosBrasil.estados.find(e => e.nome === estadosSelect.value);
  const cidade = estado?.cidades.find(c => c.nome === cidadesSelect.value);
  const loja = cidade?.lojas.find(l => l.nome === lojaNome);

  if (!loja) {
    // Oculta tudo se a loja não for encontrada
    enderecoContainer.classList.add("hidden");
    document.getElementById("vendedoresExistentes").classList.add("hidden");
    document.getElementById("vendedoresArea").classList.add("hidden");
    enderecoInput.value = "";
    listaVendedores.innerHTML = "";
    return;
  }

  // Mostra os campos se a loja for válida
  enderecoContainer.classList.remove("hidden");
  document.getElementById("vendedoresExistentes").classList.remove("hidden");
  document.getElementById("vendedoresArea").classList.remove("hidden");

  enderecoInput.value = loja.endereco;
  listaVendedores.innerHTML = "";

  loja.vendedores.forEach((v, index) => {
    const card = criarCardVendedor(v, loja, index);
    listaVendedores.appendChild(card);
  });
}



function salvarNovoEstado() {
  const nome = selectNovoEstado.value;
  if (!nome) return alert("Selecione um estado válido.");

  dadosBrasil.estados.push({ nome, cidades: [] });

  selectNovoEstado.classList.add("hidden");
  btnSalvarEstado.classList.add("hidden");
  estadosSelect.classList.remove("hidden");

  carregarEstados();
  estadosSelect.value = nome;
  carregarCidades(nome);
  atualizarCodigoGerado();
}

function salvarNovaCidade() {
  const nomeCidade = novaCidadeInput.value.trim();
  if (!nomeCidade) return alert("Digite um nome de cidade.");
  const estado = dadosBrasil.estados.find(e => e.nome === estadosSelect.value);
  if (!estado) return alert("Estado não encontrado.");
  estado.cidades.push({ nome: nomeCidade, lojas: [] });
  novaCidadeInput.value = "";
  novaCidadeInput.classList.add("hidden");
  btnSalvarCidade.classList.add("hidden");
  cidadesSelect.classList.remove("hidden");
  carregarCidades(estado.nome);
  cidadesSelect.value = nomeCidade;
  carregarLojas(nomeCidade);
  atualizarCodigoGerado();
}

function salvarNovaLoja() {
  const nomeLoja = nomeLojaInput.value.trim();
  const endereco = enderecoInput.value.trim();
  if (!nomeLoja || !endereco) return alert("Digite o nome da loja e o endereço.");
  const estado = dadosBrasil.estados.find(e => e.nome === estadosSelect.value);
  const cidade = estado?.cidades.find(c => c.nome === cidadesSelect.value);
  if (!cidade) return alert("Cidade não encontrada.");
  
  cidade.lojas.push({ nome: nomeLoja, endereco, vendedores: [] });

  nomeLojaInput.value = "";
  nomeLojaInput.classList.add("hidden");
  btnSalvarLoja.classList.add("hidden");
  lojasSelect.classList.remove("hidden");

  carregarLojas(cidade.nome);
  lojasSelect.value = nomeLoja;

  enderecoInput.value = endereco;
  enderecoContainer.classList.remove("hidden");

  carregarLoja(nomeLoja); // ✅ Esta linha faz com que os campos de vendedores apareçam

  atualizarCodigoGerado();
}


btnNovaCidade.addEventListener("click", () => {
  if (!estadosSelect.value) return alert("Selecione um estado primeiro.");
  btnNovaCidade.classList.add("hidden"); // ⬅ Oculta o botão

  cidadesSelect.classList.add("hidden");
  novaCidadeInput.classList.remove("hidden");
  btnSalvarCidade.classList.remove("hidden");
});

btnNovaLoja.addEventListener("click", () => {
  if (!cidadesSelect.value && novaCidadeInput.classList.contains("hidden")) return alert("Selecione ou adicione uma cidade.");
  lojasSelect.classList.add("hidden");
  btnNovaLoja.classList.add("hidden"); // ⬅ Oculta o botão
  nomeLojaInput.classList.remove("hidden");
  btnSalvarLoja.classList.remove("hidden");
  enderecoContainer.classList.remove("hidden");
});

btnNovoEstado.addEventListener("click", () => {
  btnNovoEstado.classList.add("hidden"); // ⬅ Oculta o botão
  estadosSelect.classList.add("hidden");
  carregarEstadosDisponiveis();
  selectNovoEstado.classList.remove("hidden");
  btnSalvarEstado.classList.remove("hidden");
});

btnSalvarEstado.addEventListener("click", salvarNovoEstado);
btnSalvarCidade.addEventListener("click", salvarNovaCidade);
btnSalvarLoja.addEventListener("click", salvarNovaLoja);

selectNovoEstado.addEventListener("keydown", e => { if (e.key === "Enter") salvarNovoEstado(); });
novaCidadeInput.addEventListener("keydown", e => { if (e.key === "Enter") salvarNovaCidade(); });
nomeLojaInput.addEventListener("keydown", e => { if (e.key === "Enter") salvarNovaLoja(); });

estadosSelect.addEventListener("change", () => carregarCidades(estadosSelect.value));
cidadesSelect.addEventListener("change", () => carregarLojas(cidadesSelect.value));
lojasSelect.addEventListener("change", () => carregarLoja(lojasSelect.value));

carregarEstados();

btnResetarFormulario.addEventListener("click", () => {
  // Resetar selects
  estadosSelect.value = "";
  cidadesSelect.innerHTML = "";
  lojasSelect.innerHTML = "";

  // Resetar inputs
  enderecoInput.value = "";
  novaCidadeInput.value = "";
  nomeLojaInput.value = "";

  // Ocultar campos de criação
  novaCidadeInput.classList.add("hidden");
  nomeLojaInput.classList.add("hidden");
  selectNovoEstado.classList.add("hidden");

  // Mostrar selects novamente
  estadosSelect.classList.remove("hidden");
  cidadesSelect.classList.remove("hidden");
  lojasSelect.classList.remove("hidden");

  // Ocultar botões de salvar
  btnSalvarEstado.classList.add("hidden");
  btnSalvarCidade.classList.add("hidden");
  btnSalvarLoja.classList.add("hidden");

  // Mostrar botões de novo
  btnNovoEstado.classList.remove("hidden");
  btnNovaCidade.classList.remove("hidden");
  btnNovaLoja.classList.remove("hidden");

  // Limpar vendedores
  listaVendedores.innerHTML = "";
  vendedoresContainer.innerHTML = "";

  // Esconder áreas de vendedores
  document.getElementById("vendedoresExistentes").classList.add("hidden");
  document.getElementById("vendedoresArea").classList.add("hidden");

  // Limpar código gerado
  codigoGerado.textContent = "";
  btnDownload.classList.add("hidden");
  btnCopiarCodigo.classList.add("hidden");

  // Esconder o Endereço
  enderecoContainer.classList.add("hidden");

});

