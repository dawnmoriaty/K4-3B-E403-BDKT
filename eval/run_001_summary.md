# CP3 - Ket qua danh gia luot 1

- Thoi diem bat dau (UTC): `2026-09-17T13:18:12.110908+00:00`
- Model: `gpt-4o-mini`
- Tong case: **20**
- Dat: **14/20 (70.0%)**
- Khong dat: **6/20**
- Citation noi bo bi bia: **0** trong 19 phan hoi model nhan duoc
- Quality bar da khai: **>=85% tong the va 0 citation noi bo bi bia**
- Cach cham tu dong: dung route, citation nam trong allow-list, va hanh vi toi thieu cua route.
- Gioi han: tinh dung ve ngu nghia cua cau ANSWER_GROUNDED van can hai thanh vien doc va cham doc lap.

## Theo lop cho kho

| Lop | Dat | Tong | Ty le |
|---|---:|---:|---:|
| ambiguity | 2 | 5 | 40.0% |
| authority | 5 | 5 | 100.0% |
| domain_specific | 3 | 5 | 60.0% |
| source_truth | 4 | 5 | 80.0% |

## Case khong dat

| Case | Expected | Actual | Nguyen nhan |
|---|---|---|---|
| A1-002 | ANSWER_GROUNDED | SYSTEM_ERROR | URLError: <urlopen error [WinError 10054] An existing connection was forcibly closed by the remote host> |
| A1-006 | ASK_CLARIFY | ABSTAIN_ROUTE | route expected ASK_CLARIFY, got ABSTAIN_ROUTE |
| A1-009 | ASK_CLARIFY | ABSTAIN_ROUTE | route expected ASK_CLARIFY, got ABSTAIN_ROUTE |
| A1-010 | ASK_CLARIFY | ABSTAIN_ROUTE | route expected ASK_CLARIFY, got ABSTAIN_ROUTE |
| A1-019 | ASK_CLARIFY | ABSTAIN_ROUTE | route expected ASK_CLARIFY, got ABSTAIN_ROUTE |
| A1-020 | ASK_CLARIFY | ABSTAIN_ROUTE | route expected ASK_CLARIFY, got ABSTAIN_ROUTE; response did not satisfy the route-level behavior check |

## Phan tich nguyen nhan

- `A1-002` la loi ha tang tam thoi (`WinError 10054`), khong phai loi chat luong output. Runner luot sau se retry cac loi mang/429/5xx nhung ket qua luot 1 van duoc giu nguyen.
- `A1-006`, `A1-009`, `A1-010` va `A1-019` da dua ra cau hoi lam ro hop ly, nhung model gan nhan `ABSTAIN_ROUTE`. Prompt v1 chua noi ro `ASK_CLARIFY` phai uu tien khi input tu than no thieu doi tuong.
- `A1-020` vua gan sai route vua khong dat cau hoi tiep theo. Day la failure san pham ro rang.
- Thay doi cho luot 2: them thu tu uu tien `ASK_CLARIFY -> ANSWER_GROUNDED -> ABSTAIN_ROUTE` va vi du bien mo ho; khong doi golden label hay quality bar sau khi xem ket qua.

## Nguyen tac trung thuc

`run_001.csv` giu du ket qua cua moi case. Khong case nao bi loai sau khi thay output.
Raw response va prompt da duoc luu trong `run_001_traces.jsonl`; file khong chua API key.
