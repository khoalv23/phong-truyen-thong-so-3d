# Geometry Guardrails For Scene 4

Tai lieu nay ghi lai cac nguyen tac khi them/sua hinh hoc 3D cho `scene-4`, de tranh lap lai tinh trang co vat the nam ngoai khong gian phong kin, bi tuong/tran che khuat hoac khong bao gio nhin thay.

## Nguyen Tac Chinh

Moi mesh duoc tao ra phai thuoc mot trong cac nhom ro rang:

```text
1. San di lai
2. Tuong / tran / vien gioi han khong gian
3. Noi dung trung bay ben trong phong
4. Den / hieu ung can thiet cho vung nhin thay
5. UI 3D co chu dich nhu bang dinh huong, bien chi dan
```

Neu mot mesh khong thuoc cac nhom tren, khong nen them vao scene.

## Vung Khong Gian Hop Le

Camera chi duoc di chuyen trong cac vung ma `isPointInFlowerFloor(x, z)` cho phep:

- Vanh khuyen trung tam: tu `HUB_R` den `RING_OUT`.
- Bon phong cheo: tu `RING_OUT` den `R_BACK`, rong trong `ROOM_W`.
- Loi vao Nam: khoang noi giua hai phong goc Tay Nam va Dong Nam, tu RING_OUT den FLARE_Z.

Khi them vat the trung bay, diem neo cua vat the nen nam trong mot trong cac vung nay hoac gan sat mat trong cua tuong phong.

## Khong Tao Lop Che Lon Neu Khong Bat Buoc

Tranh cac mat phang che phu cuc lon nhu:

```js
new THREE.CircleGeometry(R_OUT + 5, ...)
new THREE.CircleGeometry(R_OUT + 5, ...)
```

Nhung lop nay de che khe tran/san nhung thuong tao ra vat the an nam ngoai phong kin. Neu can che khe, hay tao patch dung theo polygon cua khu vuc can che bang `createFlatCeilingPatch(points, y)` thay vi dung mot mat phang lon.

## San Va Tham

Tham trung tam chi nen phu toi vung trung tam:

```js
const carpetFillOuterR = RING_OUT + 0.05;
```

Khong dung `R_OUT` cho tham trung tam, vi `R_OUT` la ban kinh ngoai cua cac connector/phong, lon hon nhieu so voi san trung tam va se tao vung tham an sau tuong.

Dung `R_OUT` chi cho cac thanh phan bien ngoai co chu dich:

- Tuong cong connector.
- Tran/bo tran cua phong can khop voi tuong ngoai.

## Tran

Moi vung tran nen duoc tao theo dung vung san/tuong ben duoi:

- Trung tam: vong tu `HUB_R` den `RING_OUT + WALL_T`.
- Phong cheo: tu `RING_OUT` den `R_BACK`.
- Loi vao: polygon giua cac diem `SOUTH.doorA`, `SOUTH.doorB`, `SOUTH.backB`, `SOUTH.backA` va cac doan hanh lang.

Khong tao mot tran nen toan cuc de "phong ho". Neu thay khe tran, sua polygon/shape cua vung do.

## Tuong Va Connector

Tuong nam ngoai vung di lai la hop le neu no la phan gioi han khong gian:

```text
createStraightGapWall(...)
createArcWallSolid(...)
createClosedConnectors(...)
```

Nhung khong gan tranh, bang, den trang tri hoac noi dung tuong tac len mat ngoai cua cac tuong nay tru khi co chu dich ro rang.

## Checklist Truoc Khi Them Mesh Moi

Truoc khi `scene.add(mesh)` hoac `group.add(mesh)`, tu kiem tra:

```text
[ ] Mesh nay co nhin thay duoc tu vung camera di lai khong?
[ ] No nam trong phong/sanh/hanh lang nao?
[ ] Neu nam ngoai `isPointInFlowerFloor`, no co phai tuong/tran/gioi han khong gian khong?
[ ] Kich thuoc cua no co vuot qua RING_OUT, R_BACK, FLARE_Z ma khong co ly do khong?
[ ] No co bi tuong/tran khac che hoan toan khong?
[ ] No co phai lop "che khe" qua lon khong?
```

Neu bat ky cau nao khong tra loi duoc, dung lai va tinh lai vung dat mesh.

## Checklist Sau Khi Sua

Chay cac lenh kiem tra:

```powershell
Get-ChildItem -Recurse -Filter '*.js' .\scene\scene-4\scripts | ForEach-Object { node --check $_.FullName }
```

Tim cac bieu thuc co nguy co tao vat the qua lon:

```powershell
rg -n "R_OUT \\+|R_OUT -|CircleGeometry\\(R_OUT|padHalf|backstop" .\\scene\\scene-4\\scripts
```

Neu co ket qua, doc tung dong va phan loai:

```text
Hop le: tuong/tran/connector gioi han khong gian.
Can xem lai: tham, san, mat phang che khe, den, bang, tranh, hien vat.
```

## Quy Tac Dat Ten

Neu mot mesh chi dung de che khe tam thoi, ten bien/hàm phai noi ro:

```js
ceilingPatch
wallGapPatch
connectorCeilingPatch
```

Khong dung ten mo ho nhu:

```js
backstop
fill
cover
pad
```

Tru khi co comment giai thich vung nao no che va vi sao khong the tao patch chinh xac hon.

## Ghi Chu Ve Scene Hien Tai

Da tung co 2 truong hop can tranh lap lai:

```text
1. carpetFillOuterR dung R_OUT, tao tham trung tam bi phu toi ~50.5m thay vi ~30.35m.
2. createCeilingBackstop tao dia tran ban kinh ~55.6m va mot pad chu nhat ngoai vung nhin thay.
```

Hai truong hop nay da duoc loai bo. Cac lan sua sau nen giu nguyen nguyen tac: chi tao hinh hoc dung theo vung phong that, khong dung mat phang/toan cuc de che loi cuc bo.
