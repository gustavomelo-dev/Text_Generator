const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const containerVendedores = document.getElementById("vendedorContainer");

let arquivosSelecionados = [];

// Seletores da localização
const selEstado = document.getElementById("selectEstado");
const selCidade = document.getElementById("selectCidade");
const selLoja = document.getElementById("selectLoja");

// Ao carregar, popular estados
document.addEventListener("DOMContentLoaded", () => {
  preencherSelect(selEstado, dadosBrasil.estados);
});

selEstado.addEventListener("change", () => {
  const estado = dadosBrasil.estados[selEstado.value];
  if (estado) preencherSelect(selCidade, estado.cidades);
  containerVendedores.innerHTML = "";
});

selCidade.addEventListener("change", () => {
  const estado = dadosBrasil.estados[selEstado.value];
  const cidade = estado?.cidades[selCidade.value];
  if (cidade) preencherSelect(selLoja, cidade.lojas);
  containerVendedores.innerHTML = "";
});

selLoja.addEventListener("change", () => {
  const estado = dadosBrasil.estados[selEstado.value];
  const cidade = estado?.cidades[selCidade.value];
  const loja = cidade?.lojas[selLoja.value];

  if (!loja) return;

  // Gera os checkboxes de vendedores
  containerVendedores.innerHTML = "";

  const checkAll = document.createElement("input");
  checkAll.type = "checkbox";
  checkAll.id = "checkAll";
  checkAll.className = "mr-2";

  const labelAll = document.createElement("label");
  labelAll.className = "block font-semibold text-sm text-gray-800 mb-2";
  labelAll.textContent = "Selecionar todos";
  labelAll.prepend(checkAll);

  containerVendedores.appendChild(labelAll);

  checkAll.addEventListener("change", () => {
    const checkboxes = containerVendedores.querySelectorAll(".vendedor-checkbox");
    checkboxes.forEach(cb => cb.checked = checkAll.checked);
  });

  loja.vendedores.forEach(vendedor => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "vendedor-checkbox mr-2";
    checkbox.value = JSON.stringify({
      nome: vendedor.nome,
      numero: vendedor.numero,
      endereco: loja.endereco,
      localidade: cidade.nome + " - " + estado.nome
    });

    const label = document.createElement("label");
    label.className = "block text-sm text-gray-800";
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(`${vendedor.nome} (${vendedor.numero})`));

    containerVendedores.appendChild(label);
  });
});

// Preencher qualquer <select>
function preencherSelect(select, opcoes) {
  select.innerHTML = "<option value=''>-- Selecione --</option>";
  opcoes.forEach((item, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = item.nome;
    select.appendChild(opt);
  });
}

// Upload de arquivos .txt
fileInput.addEventListener("change", async () => {
  const novosArquivos = Array.from(fileInput.files);
  for (const novo of novosArquivos) {
    const texto = await novo.text();
    arquivosSelecionados.push({ name: novo.name, content: texto });
  }
  fileInput.value = "";
  atualizarLista();
});

function atualizarLista() {
  fileList.innerHTML = "";
  arquivosSelecionados.forEach((arquivo) => {
    const li = document.createElement("li");
    li.textContent = arquivo.name;
    li.className = "bg-gray-50 p-2 rounded shadow";
    fileList.appendChild(li);
  });
}

function gerarZip() {
  const dataInput = document.getElementById("DATA_VALID").value.trim();
  const [ano, mes, dia] = dataInput.split("-");
  const data = `${dia}/${mes}/${ano}`;

  if (!dataInput) {
    alert("Preencha a data de validade!");
    return;
  }

  if (arquivosSelecionados.length === 0) {
    alert("Adicione ao menos um arquivo.");
    return;
  }

  const checkboxes = document.querySelectorAll(".vendedor-checkbox:checked");
  if (checkboxes.length === 0) {
    alert("Selecione ao menos um vendedor.");
    return;
  }

  const zip = new JSZip();

  checkboxes.forEach(cb => {
    const vendedor = JSON.parse(cb.value);
    const pasta = zip.folder(vendedor.nome.replace(/\s+/g, "_"));

    arquivosSelecionados.forEach(arquivo => {
      const texto = arquivo.content
        .replace(/{VEND_NAME}/g, vendedor.nome)
        .replace(/{VEND_NUMBER}/g, vendedor.numero)
        .replace(/{END_LOJA}/g, vendedor.endereco)
        .replace(/{DATA_VALID}/g, data)
        .replace(/{LOCALIDADE}/g, vendedor.localidade);

      pasta.file(arquivo.name, texto);
    });
  });

  zip.generateAsync({ type: "blob" }).then(blob => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "anuncios.zip";
    a.click();
    document.getElementById("status").textContent = "ZIP gerado com sucesso!";
  });
}
