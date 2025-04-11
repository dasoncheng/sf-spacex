import pkg from "node-forge";
const { md, pki, util, cipher } = pkg;

/**
 * 创建一个字符串的MD5哈希
 * @param {string} raw - 要哈希的字符串
 * @returns {string} 哈希后的字符串
 */
export function md5(raw: string): string {
  return md.md5.create().update(raw).digest().toHex();
}

const keys = {
  publicKey: `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAvalS6OXbfD6Rac8GIEuW
HGncdKPhup8+g5JxlSieLPMaxJILFA4+glDDbjo1GuC3lNvlL5e7kjyjIIVBP8pz
dwqzdzBi0wjyo2RBpVEBUQd+hWCENW30q1RF6F4D+rh/wVBmhFN6sYex+Hd1v3Mo
AO98aXmraAdJRa6kiHBv6WXztXiZmtaIpEgQjhFy66jSfPY7EyB87+3PooFutBuP
sJNFfVmP494CFSqzI3sC8mBbAtLDoqO4m/tUxIbtL2N7SgCmKwQ+XqI7qs03n58h
dV4vOa3cW8em8om5wo2uS+Cvz+GQsfRaMH9N1nW+k9ITTGewm9R2YzeOiPXMp61o
OTXIj66GTkQfkaGuNIGBoY1L2oEdfutLgX8RSpnmEOpJwkmhY09EV+km/T4W/h+3
dPy8JP+Eoq7iPdD4oZZaWcrSk/7RYPfRlHjqzS9Z/flToagHLNKCAKjqIOy2DpIf
5OiicTjiQ7fymQI/HWsepN1Hl4awUS0nhP2hH3oZlRO37OGicKl12mtxSUyUxCEY
sZFnNP0vnew9XtuzfjWQ+jBH2zNCebTEe9sEJd4746pdP2EWVFUodfuSZDRpegh4
guk6+1ot8GCsHVW/nM5eQnZREUxN7/7b0RbNfuS+99/Du4Dq/kUiigppKYIh+FzE
eYSjkEfAgCLnsWCU+E67/fcCAwEAAQ==
-----END PUBLIC KEY-----`,
  privateKey: `-----BEGIN PRIVATE KEY-----
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
sclU1z0G/4UIlxhU+ztiI8Pt0DDa4m4=
-----END PRIVATE KEY-----`,
};

const source =
  "26d3b9fbb0233478a6d075d06e90cd83c2ffa9790b40ba3e1467d2eb02109996";
const signature =
  "BPwkEvGaaOepFguZJweS4aZX4vp0h089gcwEI6d6Z3V1/d8jj24PMyK/4uN57fkSU/3adYgS/evSeaa1DHI0/bzRsnN00fK1cFlBlOqghGX+AFiRSSPtrChweqDzRX75g/7Cij7c533trGuHrsk1mIqeP+L8c/1d22aoQgnWy7gQ2QN62uLV12LrkxeBLiPhe6TDZdsoGfsyyClq94MEkxgVu/h5JB1WDgT82G69mesn6yoQbaJfiXAWIMXCqDaLXpr4M7qKn8tx+OBQXv9+UafJPNQgZsYN+Rn86FdscHUzegOIjlUs+2bvhqjVl8kizaOOx/koOJkuYsKiV0o/HJ814y2Thh4xhyTEjwpvYR19agBCP8z5OvBgjVbXoxkgNdUu2NF1fz3gXxa+wYno++/e0ZsigmZs32SpEpL9xuVw2Mjh8Qp4//rDjxdsZety/6vUJZfNNeOy+JPPJE8Cbvtq/5/feaC+uHkCfYiyRlavi8+DONgCIYOTsjqHIaaI9bYeE/D+Nvy5VmaJOndbph6+GjCj0f5rLeuRP/JIQ1VZk8n/tbdrHCPwB/D71udeXvqe9XyCFuSeMVtB6iUep7i4ErknJ6VVEFs5lrXevS7w9giFZ6lh6+ZrJed/85lfsohTNImkZ3eW0a2X9jch5VlhcfvSUuTssglprb1ka2s=";
