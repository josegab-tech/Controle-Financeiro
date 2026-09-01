const form = document.getElementById('form')
const descImput = document.getElementById('descricao')
const valorImput = document.getElementById('montante')
const balancoH1 = document.getElementById('balanco')
const receitaP = document.getElementById('din-positivo')
const despesaP = document.getElementById('din-negativo')
const transacoesUL = document.getElementById('transacoes')
const tipoSelect = document.getElementById('tipo')

// ls
const chave_transacoes_ls = 'transacoes'
const chave_contador_id = 'transacoes_id_contador'

let transacoesSalvas;

try {
    transacoesSalvas = JSON.parse(localStorage.getItem(chave_transacoes_ls))
} catch (error) {
    transacoesSalvas = null;
}
if (transacoesSalvas == null || transacoesSalvas == undefined) {
    transacoesSalvas = []
}

//inicializando o contador
let proximoId = parseInt(localStorage.getItem(chave_contador_id)) || 0;
if (isNaN(proximoId)) {
    proximoId = 0;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const descTransacao = descImput.value.trim();
    const valorTexto = valorImput.value.trim();
    const tipoTransacao = tipoSelect.value; // tenho que alternar entre receita ou despesa

    if (descTransacao == '' || valorTexto == '') {
        alert('Descrição e valor não podem ser vazios.')
        return;
    }

    let valorNumerico = parseFloat(valorTexto);

    if (tipoTransacao === 'despesa') {
        valorNumerico = -Math.abs(valorNumerico); // valor negativo (despesa)
    } else {
        valorNumerico = Math.abs(valorNumerico); // valor positivo (receita)
    }

    descImput.value = ''
    valorImput.value = ''

    const transacao = {
        id: proximoId++, // Pega o falor atual e incrementa
        descricao: descTransacao,
        valor: valorNumerico
    }

    localStorage.setItem(chave_contador_id, proximoId) // atualiza o contador no localStorage

    somaAoSaldo(transacao)
    somaReceitaDespesa(transacao)
    addTransacaoAoDOM(transacao)

    transacoesSalvas.push(transacao)
    localStorage.setItem(chave_transacoes_ls, JSON.stringify(transacoesSalvas))
});

function addTransacaoAoDOM(transacao) {

    const classeCSS = transacao.valor >= 0 ? 'positivo' : 'negativo'




    const li = document.createElement('li')
    li.classList.add(classeCSS)
    li.setAttribute.add('data-id', transacao.id)

    li.innerHTML = `${transacao.descricao}
                    <span>R$${transacao.valor.toFixed(2)}</span>
                    <button onClick="excluiTransacao(${transacao.id})"
                    class="delete-btn">X</button>`

    transacoesUL.append(li)
}

function somaReceitaDespesa(transacao) {

    const elemento = transacao.valor > 0 ? receitaP : despesaP
    const substituir = transacao.valor > 0 ? "+ R$" : "- R$";
    let valorAtual = elemento.innerHTML.replace(substituir, "")
    valorAtual = parseFloat(valorAtual)
    valorAtual += Math.abs(transacao.valor)
    elemento.innerHTML = valorAtual
    elemento.innerHTML = `${substituir}${valorAtual.toFixed(2)}`
}

function somaAoSaldo(transacao) {
    const valorTransacao = transacao.valor;

    let total = balancoH1.innerHTML.replace('R$', '')
    total = parseFloat(total)
    total += valorTransacao
    balancoH1.innerHTML = `R$${total.toFixed(2)}`
}

function carregarDados() {
    transacoesUL.innerHTML = ''
    balancoH1.innerHTML = 'R$0.00'
    receitaP.innerHTML = '+ R$0.00'
    despesaP.innerHTML = '- R$0.00'

    for (let i = 0; i < transacoesSalvas.length; i++) {

        somaAoSaldo(transacoesSalvas[i])
        somaReceitaDespesa(transacoesSalvas[i])
        addTransacaoAoDOM(transacoesSalvas[i])

    }
}
carregarDados();

function excluiTransacao(id) {
    alert(id)
    const transacaoIndex = transacoesSalvas.findIndex((transacao) =>
        Number(transacao.id) == Number(id)

    );


    if (transacaoIndex !== -1) {

        const transacaoRemovida = transacoesSalvas[transacaoIndex];

        transacoesSalvas.splice(transacaoIndex, 1) // o 1 é de quantos ele será removido a partir do valor passado

        localStorage.setItem(chave_transacoes_ls,
            JSON.stringify(transacoesSalvas))

        const liParaRemover = transacoesUL.querySelector(`li[data-id="${id}"]`);
        if (liParaRemover) {
            liParaRemover.remove();
        }

        subtraiDoSaldoEDespesas(transacaoRemovida)
    }

}

function subtraiDoSaldoEDespesas(transacao) {

    let total = parseFloat(balancoH1.innerHTML.replace('R$', ''));
    total -= transacao.valor;
    balancoH1.innerHTML = `R$${total.toFixed(2)}`;

    const elemento = transacao.valor > 0 ? receitaP : despesaP;
    const substituir = transacao.valor > 0 ? "+ R$" : "- R$";

    let valorAtual = parseFloat(elemento.innerHTML.replace(substituir, ''));
    valorAtual -= Math.abs(transacao.valor);

    elemento.innerHTML = `${substituir}${valorAtual.toFixed(2)}`;
}