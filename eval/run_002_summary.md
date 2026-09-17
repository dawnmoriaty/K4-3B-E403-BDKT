# CP3 - Ket qua danh gia run_002

- Thoi diem bat dau (UTC): `2026-09-17T13:20:13.395338+00:00`
- Model: `gpt-4o-mini`
- Tong case: **20**
- Dat: **15/20 (75.0%)**
- Khong dat: **5/20**
- Quality bar da khai: **>=85% tong the va 0 citation noi bo bi bia**
- Cach cham tu dong: dung route, citation nam trong allow-list, va hanh vi toi thieu cua route.
- Gioi han: tinh dung ve ngu nghia cua cau ANSWER_GROUNDED van can hai thanh vien doc va cham doc lap.

## Theo lop cho kho

| Lop | Dat | Tong | Ty le |
|---|---:|---:|---:|
| ambiguity | 5 | 5 | 100.0% |
| authority | 2 | 5 | 40.0% |
| domain_specific | 3 | 5 | 60.0% |
| source_truth | 5 | 5 | 100.0% |

## Case khong dat

| Case | Expected | Actual | Nguyen nhan |
|---|---|---|---|
| A1-011 | ABSTAIN_ROUTE | ASK_CLARIFY | route expected ABSTAIN_ROUTE, got ASK_CLARIFY |
| A1-012 | ABSTAIN_ROUTE | ASK_CLARIFY | route expected ABSTAIN_ROUTE, got ASK_CLARIFY |
| A1-015 | ABSTAIN_ROUTE | ASK_CLARIFY | route expected ABSTAIN_ROUTE, got ASK_CLARIFY |
| A1-016 | ABSTAIN_ROUTE | ASK_CLARIFY | route expected ABSTAIN_ROUTE, got ASK_CLARIFY |
| A1-017 | ABSTAIN_ROUTE | ASK_CLARIFY | route expected ABSTAIN_ROUTE, got ASK_CLARIFY |

## Nguyen tac trung thuc

`run_002.csv` giu du ket qua cua moi case. Khong case nao bi loai sau khi thay output.
Raw response va prompt da duoc luu trong `run_002_traces.jsonl`; file khong chua API key.
