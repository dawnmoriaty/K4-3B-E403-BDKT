# CP3 - Ket qua danh gia run_006

- Thoi diem bat dau (UTC): `2026-09-18T08:49:55.436046+00:00`
- Model: `gpt-4o-mini`
- Tong case: **20**
- Dat: **14/20 (70.0%)**
- Khong dat: **6/20**
- Quality bar da khai: **>=85% tong the va 0 citation noi bo bi bia**
- Cach cham tu dong: dung route, citation nam trong allow-list, va hanh vi toi thieu cua route.
- Gioi han: tinh dung ve ngu nghia cua cau ANSWER_GROUNDED van can hai thanh vien doc va cham doc lap.

## Theo lop cho kho

| Lop | Dat | Tong | Ty le |
|---|---:|---:|---:|
| ambiguity | 2 | 4 | 50.0% |
| authority | 4 | 4 | 100.0% |
| domain_specific | 1 | 2 | 50.0% |
| source_truth | 7 | 10 | 70.0% |

## Case khong dat

| Case | Expected | Actual | Nguyen nhan |
|---|---|---|---|
| A1-006 | ABSTAIN_ROUTE | ANSWER_GROUNDED | route expected ABSTAIN_ROUTE, got ANSWER_GROUNDED; citations expected subset [], got ['D1-SLIDE-04', 'D1-SLIDE-23', 'D1-SLIDE-24']; response did not satisfy the route-level behavior check |
| A1-007 | ABSTAIN_ROUTE | ANSWER_GROUNDED | route expected ABSTAIN_ROUTE, got ANSWER_GROUNDED; citations expected subset [], got ['T02-038']; response did not satisfy the route-level behavior check |
| A1-012 | ANSWER_GROUNDED | ASK_CLARIFY | route expected ANSWER_GROUNDED, got ASK_CLARIFY; citations expected subset ['D1-SLIDE-04'], got []; response did not satisfy the route-level behavior check |
| A1-013 | ASK_CLARIFY | ABSTAIN_ROUTE | route expected ASK_CLARIFY, got ABSTAIN_ROUTE; response did not satisfy the route-level behavior check |
| A1-014 | ASK_CLARIFY | ANSWER_GROUNDED | route expected ASK_CLARIFY, got ANSWER_GROUNDED; citations expected subset [], got ['D2-SLIDE-20']; response did not satisfy the route-level behavior check |
| A1-018 | ABSTAIN_ROUTE | ANSWER_GROUNDED | route expected ABSTAIN_ROUTE, got ANSWER_GROUNDED; citations expected subset [], got ['T06-130']; response did not satisfy the route-level behavior check |

## Nguyen tac trung thuc

`run_006.csv` giu du ket qua cua moi case. Khong case nao bi loai sau khi thay output.
Raw response va prompt da duoc luu trong `run_006_traces.jsonl`; file khong chua API key.
