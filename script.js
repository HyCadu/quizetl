/**
 * JOGO DE QUESTÕES - GAMES PROVAS
 * 
 * Este arquivo contém toda a lógica do jogo de questões interativo.
 * Funcionalidades implementadas:
 * - Carregamento de questões do arquivo JSON
 * - Menu inicial com seleção de categoria
 * - Sistema de jogo com feedback visual
 * - Exibição de justificativas
 * - Controle de progresso e pontuação
 */

// Variáveis globais do jogo
let questoes = []; // Array para armazenar todas as questões
let questoesFiltradas = []; // Array com questões da categoria selecionada
let questaoAtual = 0; // Índice da questão atual
let pontuacao = 0; // Pontuação do jogador
let categoriaSelecionada = ''; // Categoria escolhida pelo usuário
let respostaSelecionada = ''; // Resposta escolhida pelo usuário

// Elementos do DOM
const menuInicial = document.getElementById('menu-inicial');
const telaJogo = document.getElementById('tela-jogo');
const telaResultados = document.getElementById('tela-resultados');
const btnUA = document.getElementById('btn-ua');
const btnProximo = document.getElementById('btn-proximo');
const btnVoltarMenu = document.getElementById('btn-voltar-menu');
const btnReiniciar = document.getElementById('btn-reiniciar');

// Elementos para exibir informações do jogo
const categoriaAtual = document.getElementById('categoria-atual');
const contadorQuestao = document.getElementById('contador-questao');
const barraProgresso = document.getElementById('barra-progresso');
const textoProgresso = document.getElementById('texto-progresso');
const perguntaTexto = document.getElementById('pergunta-texto');
const opcoesResposta = document.getElementById('opcoes-resposta');
const areaJustificativa = document.getElementById('area-justificativa');
const textoJustificativa = document.getElementById('texto-justificativa');
const areaBotaoProximo = document.getElementById('area-botao-proximo');
const resultadoFinal = document.getElementById('resultado-final');

/**
 * INICIALIZAÇÃO DO JOGO
 * Carrega as questões do arquivo JSON e configura os event listeners
 */
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Carrega as questões do arquivo JSON
        await carregarQuestoes();
        
        // Configura os event listeners
        configurarEventListeners();
        
        console.log('Jogo inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar o jogo:', error);
    }
});

/**
 * CARREGAMENTO DAS QUESTÕES
 * Faz uma requisição para carregar as questões do arquivo JSON
 */
async function carregarQuestoes() {
    try {
        // Tenta carregar do caminho relativo
        const response = await fetch('./questoes.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        questoes = await response.json();
        console.log(`${questoes.length} questões carregadas com sucesso.`);
    } catch (error) {
        console.error('Erro ao carregar questões:', error);
        // Exibe mensagem amigável ao usuário
        alert('❌ Erro ao carregar as questões. Verifique se o arquivo questoes.json está no mesmo diretório que o index.html');
        throw error;
    }
}

/**
 * CONFIGURAÇÃO DOS EVENT LISTENERS
 * Define todos os eventos de clique e interação do usuário
 */
function configurarEventListeners() {
    // Botão do menu inicial
    btnUA.addEventListener('click', () => iniciarJogo('UA'));
    
    // Botões da tela de jogo
    btnProximo.addEventListener('click', proximaQuestao);
    btnVoltarMenu.addEventListener('click', voltarAoMenu);
    
    // Botão de reiniciar
    btnReiniciar.addEventListener('click', voltarAoMenu);
}

/**
 * EMBARALHAR ARRAY
 * Embaralha os elementos de um array usando o algoritmo Fisher-Yates
 * @param {Array} array - Array a ser embaralhado
 * @returns {Array} - Array embaralhado
 */
function embaralharArray(array) {
    const arrayEmbaralhado = [...array]; // Cria uma cópia do array
    for (let i = arrayEmbaralhado.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayEmbaralhado[i], arrayEmbaralhado[j]] = [arrayEmbaralhado[j], arrayEmbaralhado[i]];
    }
    return arrayEmbaralhado;
}

/**
 * INÍCIO DO JOGO
 * Filtra as questões pela categoria selecionada e inicia o jogo
 * @param {string} categoria - Categoria selecionada ('UA' ou 'Slide')
 */
function iniciarJogo(categoria) {
    categoriaSelecionada = categoria;
    
    // Filtra as questões pela categoria selecionada
    const questoesFiltradasTemp = questoes.filter(questao => questao.categoria === categoria);
    
    if (questoesFiltradasTemp.length === 0) {
        alert(`Não há questões disponíveis para a categoria "${categoria}".`);
        return;
    }
    
    // Embaralha as questões para apresentação aleatória
    questoesFiltradas = embaralharArray(questoesFiltradasTemp);
    
    // Reinicia as variáveis do jogo
    questaoAtual = 0;
    pontuacao = 0;
    
    // Atualiza a interface
    atualizarInterfaceJogo();
    
    // Esconde o menu e mostra a tela do jogo
    menuInicial.classList.add('hidden');
    telaJogo.classList.remove('hidden');
    telaResultados.classList.add('hidden');
    
    console.log(`Jogo iniciado com ${questoesFiltradas.length} questões da categoria "${categoria}" (embaralhadas)`);
}

/**
 * ATUALIZAÇÃO DA INTERFACE DO JOGO
 * Atualiza todos os elementos visuais com as informações da questão atual
 */
function atualizarInterfaceJogo() {
    const questao = questoesFiltradas[questaoAtual];
    
    // Atualiza informações do cabeçalho
    categoriaAtual.textContent = `Categoria: ${categoriaSelecionada}`;
    contadorQuestao.textContent = `Questão ${questaoAtual + 1} de ${questoesFiltradas.length}`;
    
    // Atualiza barra de progresso
    const progresso = ((questaoAtual + 1) / questoesFiltradas.length) * 100;
    barraProgresso.style.width = `${progresso}%`;
    textoProgresso.textContent = `${Math.round(progresso)}%`;
    
    // Atualiza pergunta com tratamento de links
    perguntaTexto.innerHTML = formatarPerguntaComLinks(questao.pergunta);
    
    // Limpa opções anteriores
    opcoesResposta.innerHTML = '';
    
    // Embaralha as respostas para apresentação aleatória
    const respostasEmbaralhadas = embaralharArray(questao.respostas);
    
    // Cria os botões de resposta
    respostasEmbaralhadas.forEach((resposta, index) => {
        const botaoResposta = renderizarResposta(resposta, index);
        opcoesResposta.appendChild(botaoResposta);
    });
    
    // Esconde elementos que não devem aparecer ainda
    areaJustificativa.classList.add('hidden');
    areaBotaoProximo.classList.add('hidden');
}

/**
 * RENDERIZA RESPOSTA
 * Cria o botão de resposta com base no conteúdo (texto ou imagem)
 * @param {string} resposta - Conteúdo da resposta (pode ser texto ou URL de imagem)
 * @param {number} index - Índice da resposta (para identificação da opção)
 * @returns {HTMLElement} - Botão de resposta renderizado
 */
function renderizarResposta(resposta, index) {
    const botaoResposta = document.createElement('button');
    const isImagemURL = /\.(jpg|jpeg|png|gif|webp)$/i.test(resposta) || resposta.includes('http');
    
    if (isImagemURL) {
        botaoResposta.className = 'btn-resposta';
        botaoResposta.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                <span class="letra-opcao">${String.fromCharCode(65 + index)}</span>
                <span style="font-size: 0.875rem; color: #9ca3af;">Opção ${String.fromCharCode(65 + index)}</span>
            </div>
            <div class="resposta-imagem-container">
                <img src="${resposta}" alt="Opção ${String.fromCharCode(65 + index)}" class="imagem-questao" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                     onload="this.nextElementSibling.style.display='none';">
                <div class="loading-imagem" style="display:flex;">
                    <span>⏳</span>
                    <span>Carregando imagem...</span>
                </div>
            </div>
        `;
    } else {
        botaoResposta.className = 'btn-resposta';
        botaoResposta.innerHTML = `
            <span class="letra-opcao">${String.fromCharCode(65 + index)}</span>
            ${resposta}
        `;
    }
    
    botaoResposta.addEventListener('click', () => selecionarResposta(resposta, botaoResposta));
    return botaoResposta;
}

/**
 * SELEÇÃO DE RESPOSTA
 * Processa a resposta selecionada pelo usuário
 * @param {string} resposta - Resposta selecionada
 * @param {HTMLElement} elementoBotao - Elemento HTML do botão clicado
 */
function selecionarResposta(respostaSelecionada, botaoClicado) {
    if (respostaJaSelecionada) return;
    
    respostaJaSelecionada = true;
    const questaoAtual = questoesEmbaralhadas[indiceQuestaoAtual];
    const acertou = respostaSelecionada === questaoAtual.respostaCorreta;
    
    // Desabilitar todos os botões primeiro
    const todosBotoes = opcoesResposta.querySelectorAll('.btn-resposta');
    todosBotoes.forEach(botao => {
        botao.classList.add('desabilitado');
        botao.style.pointerEvents = 'none';
    });
    
    if (acertou) {
        pontuacao++;
        botaoClicado.classList.add('correta');
        botaoClicado.classList.remove('incorreta');
    } else {
        botaoClicado.classList.add('incorreta');
        botaoClicado.classList.remove('correta');
        
        // Encontrar e destacar a resposta correta
        todosBotoes.forEach(botao => {
            // Pegar o conteúdo do botão (texto ou URL da imagem)
            const imgElement = botao.querySelector('img');
            const conteudoBotao = imgElement ? imgElement.src : botao.textContent.trim();
            
            // Remover a letra da opção do texto para comparação
            const textoLimpo = botao.textContent.replace(/^[A-E]\s*/, '').trim();
            
            if (conteudoBotao === questaoAtual.respostaCorreta || textoLimpo === questaoAtual.respostaCorreta) {
                botao.classList.add('correta');
                botao.classList.remove('incorreta');
            }
        });
    }
    
    // Mostrar justificativa e botão próximo
    textoJustificativa.textContent = questaoAtual.justificativa;
    areaJustificativa.classList.remove('hidden');
    areaBotaoProximo.classList.remove('hidden');
}

/**
 * EXIBIÇÃO DA JUSTIFICATIVA
 * Mostra a justificativa da resposta correta
 * @param {string} justificativa - Texto da justificativa
 */
function exibirJustificativa(justificativa) {
    textoJustificativa.textContent = justificativa;
    areaJustificativa.classList.remove('hidden');
    
    // Mostra o botão para próxima questão
    areaBotaoProximo.classList.remove('hidden');
}

/**
 * PRÓXIMA QUESTÃO
 * Avança para a próxima questão ou finaliza o jogo
 */
function proximaQuestao() {
    questaoAtual++;
    
    if (questaoAtual < questoesFiltradas.length) {
        // Ainda há questões - continua o jogo
        atualizarInterfaceJogo();
    } else {
        // Fim do jogo - exibe resultados
        exibirResultados();
    }
}

/**
 * EXIBIÇÃO DOS RESULTADOS FINAIS
 * Calcula e exibe a pontuação final do jogador
 */
function exibirResultados() {
    const percentual = Math.round((pontuacao / questoesFiltradas.length) * 100);
    
    let mensagemResultado = '';
    let emojiResultado = '';
    
    if (percentual >= 90) {
        emojiResultado = '🏆';
        mensagemResultado = `Excelente! Você acertou ${pontuacao} de ${questoesFiltradas.length} questões (${percentual}%)`;
    } else if (percentual >= 70) {
        emojiResultado = '🎉';
        mensagemResultado = `Muito bem! Você acertou ${pontuacao} de ${questoesFiltradas.length} questões (${percentual}%)`;
    } else if (percentual >= 50) {
        emojiResultado = '👍';
        mensagemResultado = `Bom trabalho! Você acertou ${pontuacao} de ${questoesFiltradas.length} questões (${percentual}%)`;
    } else {
        emojiResultado = '📚';
        mensagemResultado = `Continue estudando! Você acertou ${pontuacao} de ${questoesFiltradas.length} questões (${percentual}%)`;
    }
    
    resultadoFinal.innerHTML = `
        <div class="text-4xl mb-4">${emojiResultado}</div>
        <div>${mensagemResultado}</div>
    `;
    
    // Esconde a tela do jogo e mostra os resultados
    telaJogo.classList.add('hidden');
    telaResultados.classList.remove('hidden');
    
    console.log(`Jogo finalizado. Pontuação: ${pontuacao}/${questoesFiltradas.length} (${percentual}%)`);
}

/**
 * VOLTA AO MENU INICIAL
 * Reseta o jogo e retorna ao menu principal
 */
function voltarAoMenu() {
    // Reseta todas as variáveis
    questaoAtual = 0;
    pontuacao = 0;
    categoriaSelecionada = '';
    respostaSelecionada = '';
    
    // Esconde todas as telas e mostra o menu
    telaJogo.classList.add('hidden');
    telaResultados.classList.add('hidden');
    menuInicial.classList.remove('hidden');
    
    console.log('Retornado ao menu inicial');
}

/**
 * FORMATAÇÃO DE PERGUNTA COM LINKS
 * Converte URLs em links clicáveis e exibe imagens automaticamente
 * @param {string} pergunta - Texto da pergunta que pode conter URLs
 * @returns {string} - HTML formatado com links clicáveis e imagens carregadas
 */
function formatarPerguntaComLinks(pergunta) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    let perguntaFormatada = pergunta.replace(urlRegex, (url) => {
        const isImagem = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
        
        if (isImagem) {
            return `
                <div class="my-4 p-4 bg-gray-800 rounded-xl border-2 border-red-600">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="text-2xl">🖼️</span>
                        <span class="text-red-500 font-semibold">Imagem para análise:</span>
                    </div>
                    <div class="p-3 bg-gray-900 rounded-lg border border-red-500">
                        <img src="${url}" alt="Imagem da questão" class="imagem-questao max-w-full h-auto rounded-lg border border-gray-700" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                             onload="this.nextElementSibling.style.display='none';">
                        <div style="display:block;" class="text-yellow-400 text-sm mt-2 flex items-center gap-2">
                            <span>⏳</span>
                            <span>Carregando imagem...</span>
                        </div>
                    </div>
                    <a href="${url}" target="_blank" class="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 mt-3">
                        <span>📷</span>
                        <span>Abrir imagem em nova aba</span>
                        <span>🔗</span>
                    </a>
                </div>
            `;
        } else {
            return `<a href="${url}" target="_blank" class="text-red-500 hover:text-red-400 underline transition-colors duration-300">🔗 ${url}</a>`;
        }
    });
    
    return perguntaFormatada;
}

// Log de inicialização
console.log('Script do jogo carregado com sucesso!');
