/** Sale del sitio hacia otra página (por ejemplo, a pagar en Mercado Pago). Aparte para poder simularlo en las pruebas. */
export function irA(url: string) {
  window.location.assign(url);
}
