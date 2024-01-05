const faker = require('faker');
const MailosaurClient = require('mailosaur');


function gerarCPF() {
  let num = Math.floor(Math.random() * 999999999);
  let numStr = num.toString().padStart(9, '0');

  let soma = 0;
  for (let i = 10; i > 1; i--) {
      soma += numStr.charAt(10 - i) * i;
  }

  let primeiroDigito = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  numStr += primeiroDigito;

  soma = 0;
  for (let i = 11; i > 1; i--) {
      soma += numStr.charAt(11 - i) * i;
  }

  let segundoDigito = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  numStr += segundoDigito;

  return numStr;
}

function gerarNumeroCelular() {
  const ddds = [11, 21, 31, 41, 51, 61, 71, 81, 91]; // Exemplo de DDDs
  const ddd = ddds[Math.floor(Math.random() * ddds.length)];
  const numero = 900000000 + Math.floor(Math.random() * 100000000);
  return `${ddd}${numero}`;
}

function gerarEmailAleatorio() {
  const dominio = "@mailinator.com";
  const chars = "abcdefghijklmnopqrstuvwxyz1234567890";
  let nomeUsuario = "";
  for (let i = 0; i < 10; i++) {
      nomeUsuario += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nomeUsuario + dominio;
}


function gerarNumeroCasaAleatorio() {
  // Gera um número aleatório entre 1 e 2000
  const numeroCasa = Math.floor(Math.random() * 2000) + 1;
  return numeroCasa.toString();
}

function formatarDataParaDDMMYYYY(data) {
  let dia = data.getDate().toString().padStart(2, '0');
  let mes = (data.getMonth() + 1).toString().padStart(2, '0'); // getMonth() retorna 0 para janeiro, 1 para fevereiro, etc.
  let ano = data.getFullYear();
  return `${dia}-${mes}-${ano}`;
}

Cypress.on('uncaught:exception', (err, runnable) => {
  // retorna false para impedir que o Cypress falhe o teste
  return false;
});

describe('Validando usuario, carrinho e pagamento', () => {
  beforeEach(() => {
    cy.visit('https://marketplace-alpha.tendaatacado.com.br/');
  });

  it('Criando usuario', () => {
    
    cy.get('.text-hello').click()
    cy.get('p > span').click()

    const nomeAleatorio = faker.name.findName();
        const cpfAleatorio = gerarCPF();
        const emailAddress = `${faker.datatype.uuid()}@${Cypress.env('MAILOSAUR_SERVER_ID')}.mailosaur.net`
        const password = Cypress.env('USER_PASSWORD')
        const celularAleatorio = gerarNumeroCelular();
        const birthday = faker.date.past(30);
        const formattedBirthday = formatarDataParaDDMMYYYY(birthday);
        const cepsValidos = ['12310-140', '12310-410', '12301-331']; // Exemplo de CEPs válidos
        const cepAleatorio = cepsValidos[Math.floor(Math.random() * cepsValidos.length)];
        const numeroCasaAleatorio = gerarNumeroCasaAleatorio();

        cy.intercept('GET', 'https://mailosaur.com/api/messages/').as('getNotes')
        cy.get('#nome').type(nomeAleatorio);
        cy.get('#cpf').type(cpfAleatorio);
        cy.get('#email').type(emailAddress);
        cy.get('#cellphone').clear().type(celularAleatorio);
        cy.get('#password').type(password);
        cy.get('#password2').type(password);
        cy.get('.btn-create-account > [data-cy="btn-"]').click();
        cy.get('label').should('be.visible') 
              
        
        cy.mailosaurGetMessage(Cypress.env('MAILOSAUR_SERVER_ID'), {
          sentTo: emailAddress
        }).then(message => {
          const regex = /<td[^>]*>\s*(\w{6})\s*<\/td>/;
            const matches = message.html.body.match(regex);
            let confirmationCode = '';

            if (matches && matches.length > 1) {
                
                confirmationCode = matches[1];
            }
          cy.wait(5000)
          cy.get('#code').type(`${confirmationCode}{enter}`)
    
          cy.contains('Código validado').should('be.visible')

          cy.get('.genders-select > :nth-child(2) > #gender').click()
          cy.get('[data-cy="inpt-text-day"]').type(formattedBirthday)
          cy.get('#zipCode').type(cepAleatorio);
          cy.get('#number').type(numeroCasaAleatorio);
          cy.get('.col-sm-12 > #name').type('Casa');
          cy.wait(1000)
          cy.get('.btn-create-account > [data-cy="btn-"]').click()

          // adicionando ao carrinho
          cy.get('.hot-links-container > :nth-child(2)').click()    
          cy.get('#shipping-cep').type(cepAleatorio);
          cy.get(':nth-child(2) > .card-content > .card-information-component').click()
          cy.get('.card-information-component').click()
          cy.get('.card-information-component').click()
          cy.get(':nth-child(1) > .card-item > .menu-actions-icons > .ButtonBuyComponent > [data-cy="btn-"]').click()
          cy.get('.LogoComponent > .svgIcon').click()
          cy.get(':nth-child(6) > .CarouselProductsContainer > .slick-slider > .slick-list > .slick-track > [data-index="1"] > :nth-child(1) > .card > .card-item > .menu-actions-icons > .ButtonBuyComponent > [data-cy="btn-"]').click()
          cy.get('#item-list-000000000000977430-PT > .box-quantity > :nth-child(3)').click()
          cy.get('#item-list-000000000000990286-UN > .box-quantity > :nth-child(3)').click()
          cy.get('#item-list-000000000000990286-UN > .box-quantity > :nth-child(1)').click()
          cy.get('#item-list-000000000000977430-PT > .box-quantity > :nth-child(1)').click()

          // Pagamento com cartao
          cy.get('.cartblock-bottom > [data-cy="btn-"]').click()
          cy.get('.resume-buttons > .btn').click()
          cy.get('.resume-buttons > .btn').click()
          cy.get('.resume-buttons > .btn').click()
          cy.wait(5000)
          cy.contains('Cartão de crédito').click()
          cy.get('#number').type('4000000000000010')
          cy.get('#month > .react-select__control > .react-select__indicators > .react-select__indicator').click()
          cy.get('#react-select-2-option-0').click()
          cy.get('#year > .react-select__control > .react-select__indicators > .react-select__indicator').click()
          cy.get('#react-select-3-option-4').click()
          cy.get('#cvv').type('111')
          cy.get('#name').type('teste adilson')
          cy.get('#cpf').type(cpfAleatorio);
          cy.get('#installments > .react-select__control > .react-select__indicators > .react-select__indicator').click()
          cy.get('#react-select-4-option-0').click()
          cy.get('.CreditCardComponent > [data-cy="btn-"]').click()
          cy.wait(15000)
          cy.get('.HeaderMessageComponent > div').contains('Seu pedido foi realizado com sucesso :)')
          })


  });

});