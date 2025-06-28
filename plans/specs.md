# 仕様

## 使用するSymbol REST API
- **ノード情報取得**: `GET /node/info`
- **署名要求取得**: `GET /transactions/partial`
- **マルチシグ情報**: `GET /account/{address}/multisig`
- **アカウント情報**: `GET /account/{address}`
- **連署アナウンス**: `PUT /transactions/cosignature`
- **署名アナウンス**: `PUT /transactions`

@docs/openapi-symbol.yml にSymbol REST API定義がある。

## アドレス
Symbol 公開鍵は より短い形式 である アドレス として共有できます。

前 24-byte Raw アドレス が構成されています: network-id バイト
アカウントの公開鍵の 160-bit (20 byte) ハッシュ
アドレスのミスタイプを素早く確認するための 3-byte のチェックサム

しかし、Raw アドレスはバイナリ配列のため、普段使いには不便なので、通常は Base32 エンコード済みをエンコード済みアドレスまたは単にアドレスと呼ばれる39文字のテキストへ変換します。

最後に、読みやすくするために、6 文字ごとにハイフンを追加して きれいなアドレス へ整形します。

例:

| Raw アドレス | 0x78,0xD0,0x44,0xED,0xC3,0xDC,0x8B,0x86... | 24バイト |
| アドレス | PDIEJ3OD3SFYNZCQUSEWKY4NRRZUI5LMJPSVLPQ | 39文字 |
| 整形アドレス | PDIEJ3-OD3SFY-NZCQUS-EWKY4N-RRZUI5-LMJPSV-LPQ | 45文字 |

ブロックチェーンと疎通せずにアドレスを作ることができます。実際、ブロックチェーンはあるトランザクションにおいて、初めて現れたアドレスと公開鍵だけを追跡しています。
