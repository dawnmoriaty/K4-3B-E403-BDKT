# CP3 - Ket qua danh gia run_003

- Thoi diem bat dau (UTC): `2026-09-17T13:21:42.657496+00:00`
- Model: `gpt-4o-mini`
- Tong case: **20**
- Dat: **18/20 (90.0%)**
- Khong dat: **2/20**
- Citation noi bo bi bia: **0**
- Quality bar da khai: **>=85% tong the va 0 citation noi bo bi bia**
- Cach cham tu dong: dung route, citation nam trong allow-list, va hanh vi toi thieu cua route.
- Gioi han: tinh dung ve ngu nghia cua cau ANSWER_GROUNDED van can hai thanh vien doc va cham doc lap.

## Theo lop cho kho

| Lop | Dat | Tong | Ty le |
|---|---:|---:|---:|
| ambiguity | 5 | 5 | 100.0% |
| authority | 5 | 5 | 100.0% |
| domain_specific | 3 | 5 | 60.0% |
| source_truth | 5 | 5 | 100.0% |

## Case khong dat

| Case | Expected | Actual | Nguyen nhan |
|---|---|---|---|
| A1-016 | ABSTAIN_ROUTE | ASK_CLARIFY | route expected ABSTAIN_ROUTE, got ASK_CLARIFY |
| A1-020 | ASK_CLARIFY | ABSTAIN_ROUTE | route expected ASK_CLARIFY, got ABSTAIN_ROUTE; response did not satisfy the route-level behavior check |

## Phan tich nguyen nhan

- `A1-016`: model coi viec thieu nuoc di Othello cu the la input mo ho va hoi lai. Golden label yeu cau chuyen nguoi vi artifact hinh anh de tham dinh khong co trong context.
- `A1-020`: model dung lai an toan nhung khong hoi user cung cap hai doan `instruction` va `system prompt`; vi vay sai route va thieu buoc tiep theo.
- Hai failure deu duoc giu nguyen. Nhom khong tiep tuc sua prompt theo tung case sau khi da vuot quality bar, tranh overfit golden set.

## Nguyen tac trung thuc

`run_003.csv` giu du ket qua cua moi case. Khong case nao bi loai sau khi thay output.
Raw response va prompt da duoc luu trong `run_003_traces.jsonl`; file khong chua API key.
