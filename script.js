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
        const response = await fetch('questoes.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        questoes = await response.json();
        console.log(`${questoes.length} questões carregadas com sucesso.`);
    } catch (error) {
        console.error('Erro ao carregar questões:', error);
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
        // Verifica se a resposta é uma URL de imagem
        const isImagemURL = /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg)$/i.test(resposta.trim());
        
        const botaoResposta = document.createElement('button');
        
        if (isImagemURL) {
            // Se for uma imagem, exibe a imagem diretamente
            botaoResposta.className = 'w-full p-4 text-left bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-vermelho-neon/50 rounded-xl transition-all duration-300 text-white font-medium';
            botaoResposta.innerHTML = `
                <div class="flex items-center gap-3 mb-2">
                    <span class="inline-block w-8 h-8 bg-white/20 rounded-full text-center leading-8">${String.fromCharCode(65 + index)}</span>
                    <span class="text-sm text-white/80">Opção ${String.fromCharCode(65 + index)}</span>
                </div>
                <div class="mt-2 p-2 bg-black/40 rounded-lg">
                    <img src="${resposta}" alt="Opção ${String.fromCharCode(65 + index)}" class="imagem-questao max-w-full h-auto rounded-lg border border-white/20" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                         onload="this.nextElementSibling.style.display='none';">
                    <div style="display:block;" class="text-yellow-300 text-xs mt-2 flex items-center gap-2">
                        <span>⏳</span>
                        <span>Carregando imagem...</span>
                    </div>
                </div>
            `;
        } else {
            // Resposta normal de texto
            botaoResposta.className = 'w-full p-4 text-left bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl transition-all duration-300 text-white font-medium';
            botaoResposta.innerHTML = `
                <span class="inline-block w-8 h-8 bg-white/20 rounded-full text-center leading-8 mr-4">${String.fromCharCode(65 + index)}</span>
                ${resposta}
            `;
        }
        
        // Adiciona evento de clique
        botaoResposta.addEventListener('click', () => selecionarResposta(resposta, botaoResposta));
        
        opcoesResposta.appendChild(botaoResposta);
    });
    
    // Esconde elementos que não devem aparecer ainda
    areaJustificativa.classList.add('hidden');
    areaBotaoProximo.classList.add('hidden');
}

/**
 * SELEÇÃO DE RESPOSTA
 * Processa a resposta selecionada pelo usuário
 * @param {string} resposta - Resposta selecionada
 * @param {HTMLElement} elementoBotao - Elemento HTML do botão clicado
 */
function selecionarResposta(resposta, elementoBotao) {
    respostaSelecionada = resposta;
    const questao = questoesFiltradas[questaoAtual];
    
    // Verifica se a resposta é uma URL de imagem
    const isImagemURL = /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg)$/i.test(resposta.trim());
    
    // Desabilita todos os botões para evitar múltiplas seleções
    const botoes = opcoesResposta.querySelectorAll('button');
    botoes.forEach(botao => {
        botao.disabled = true;
        botao.classList.remove('hover:bg-white/20');
    });
    
    // Aplica feedback visual baseado na resposta
    if (resposta === questao.respostaCorreta) {
        // Resposta correta - feedback verde com efeito neon
        elementoBotao.className = 'w-full p-4 text-left bg-green-500/80 border-2 border-green-400 rounded-xl text-white font-medium';
        elementoBotao.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.6)';
        
        if (isImagemURL) {
            // Mantém a imagem visível com feedback verde
            elementoBotao.innerHTML = `
                <div class="flex items-center gap-3 mb-2">
                    <span class="inline-block w-8 h-8 bg-green-400 rounded-full text-center leading-8">✓</span>
                    <span class="text-sm font-bold">RESPOSTA CORRETA!</span>
                </div>
                <div class="mt-2 p-2 bg-black/40 rounded-lg border border-green-400">
                    <img src="${resposta}" alt="Resposta correta" class="imagem-questao max-w-full h-auto rounded-lg">
                </div>
            `;
        } else {
            elementoBotao.innerHTML = `
                <span class="inline-block w-8 h-8 bg-green-400 rounded-full text-center leading-8 mr-4">✓</span>
                ${resposta}
            `;
        }
        pontuacao++;
    } else {
        // Resposta incorreta - feedback vermelho com efeito neon
        elementoBotao.className = 'w-full p-4 text-left bg-red-500/80 border-2 border-red-400 rounded-xl text-white font-medium';
        elementoBotao.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.6)';
        
        if (isImagemURL) {
            // Mantém a imagem visível com feedback vermelho
            elementoBotao.innerHTML = `
                <div class="flex items-center gap-3 mb-2">
                    <span class="inline-block w-8 h-8 bg-red-400 rounded-full text-center leading-8">✗</span>
                    <span class="text-sm font-bold">RESPOSTA INCORRETA</span>
                </div>
                <div class="mt-2 p-2 bg-black/40 rounded-lg border border-red-400">
                    <img src="${resposta}" alt="Resposta incorreta" class="imagem-questao max-w-full h-auto rounded-lg">
                </div>
            `;
        } else {
            elementoBotao.innerHTML = `
                <span class="inline-block w-8 h-8 bg-red-400 rounded-full text-center leading-8 mr-4">✗</span>
                ${resposta}
            `;
        }
        
        // Destaca a resposta correta
        questao.respostas.forEach((respostaOpcao, index) => {
            if (respostaOpcao === questao.respostaCorreta) {
                const botaoCorreto = botoes[index];
                const isImagemCorretaURL = /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg)$/i.test(respostaOpcao.trim());
                
                botaoCorreto.className = 'w-full p-4 text-left bg-green-500/80 border-2 border-green-400 rounded-xl text-white font-medium';
                botaoCorreto.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.6)';
                
                if (isImagemCorretaURL) {
                    botaoCorreto.innerHTML = `
                        <div class="flex items-center gap-3 mb-2">
                            <span class="inline-block w-8 h-8 bg-green-400 rounded-full text-center leading-8">✓</span>
                            <span class="text-sm font-bold">RESPOSTA CORRETA</span>
                        </div>
                        <div class="mt-2 p-2 bg-black/40 rounded-lg border border-green-400">
                            <img src="${respostaOpcao}" alt="Resposta correta" class="imagem-questao max-w-full h-auto rounded-lg">
                        </div>
                    `;
                } else {
                    botaoCorreto.innerHTML = `
                        <span class="inline-block w-8 h-8 bg-green-400 rounded-full text-center leading-8 mr-4">✓</span>
                        ${questao.respostaCorreta}
                    `;
                }
            }
        });
    }
    
    // Exibe a justificativa após um pequeno delay
    setTimeout(() => {
        exibirJustificativa(questao.justificativa);
    }, 400);
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
    // Regex para detectar URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Substitui URLs por links clicáveis ou imagens
    let perguntaFormatada = pergunta.replace(urlRegex, (url) => {
        // Verifica se é uma imagem
        const isImagem = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
        
        if (isImagem) {
            return `
                <div class="my-4 p-4 bg-black/60 rounded-xl border-2 border-vermelho-neon/40" style="box-shadow: 0 0 15px rgba(255, 0, 0, 0.2);">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="text-2xl">🖼️</span>
                        <span class="text-vermelho-neon font-semibold" style="text-shadow: 0 0 10px rgba(255, 0, 0, 0.5);">Imagem para análise:</span>
                    </div>
                    <div class="p-3 bg-black/40 rounded-lg border border-rosa-neon/30">
                        <img src="${url}" alt="Imagem da questão" class="imagem-questao max-w-full h-auto rounded-lg border border-white/20" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                             onload="this.nextElementSibling.style.display='none';">
                        <div style="display:block;" class="text-yellow-300 text-sm mt-2 flex items-center gap-2 animate-pulse">
                            <span>⏳</span>
                            <span>Carregando imagem...</span>
                        </div>
                    </div>
                    <a href="${url}" target="_blank" class="link-imagem inline-flex items-center gap-2 bg-vermelho-neon/20 hover:bg-vermelho-neon/30 text-vermelho-neon hover:text-rosa-neon px-4 py-2 rounded-lg border border-vermelho-neon/50 transition-all duration-300 transform hover:scale-105 mt-3" style="box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);">
                        <span>📷</span>
                        <span>Abrir imagem em nova aba</span>
                        <span>🔗</span>
                    </a>
                </div>
            `;
        } else {
            // Para outros tipos de links
            return `<a href="${url}" target="_blank" class="text-vermelho-neon hover:text-rosa-neon underline transition-colors duration-300" style="text-shadow: 0 0 5px rgba(255, 0, 0, 0.3);">🔗 ${url}</a>`;
        }
    });
    
    return perguntaFormatada;
}

// Log de inicialização
console.log('Script do jogo carregado com sucesso!');
