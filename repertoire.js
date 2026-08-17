// 내 레퍼토리 데이터.
// 여기에 라인을 추가/수정하면 트레이너가 자동으로 인식합니다.
// moves는 공백으로 구분된 SAN(표준 기보) 문자열이며, 항상 백의 1수부터 시작해야 합니다.
// name은 화면에 표시될 라인 이름입니다.

const REPERTOIRE = {
  white: [
    {
      name: "이탈리안 - 지오코 피아노 5.d4 뫼레르 어택 (7.Nc3)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Nc3 Nxe4 O-O Bxc3 d5 Bf6 Re1 Ne7 Rxe4 d6 Bg5 Bxg5 Nxg5 h6",
    },
    {
      name: "이탈리안 - 지오코 피아노 5.d4 조용한 라인 (7.Bd2)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Bd2 Bxd2+ Nbxd2 d5 exd5 Nxd5 Qb3 Nce7 O-O O-O Rfe1 c6",
    },
    {
      name: "이탈리안 게임 - 투 나이츠 (3...Nf6)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Bc5 c3 d6 O-O O-O Re1 a6",
    },
    {
      name: "이탈리안 게임 - 헝가리안 디펜스 (3...Be7)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Be7 d3 Nf6 c3 d6 O-O O-O Re1 a6",
    },
  ],

  black: [
    {
      name: "카로칸 - 타르타코워 (3.Nc3, 6.Bc4 체크 라인)",
      moves: "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Nxf6+ exf6 Bc4 Qe7+ Qe2 Be6",
    },
    {
      name: "카로칸 - 타르타코워 (3.Nd2 이적, 6.Bc4 체크 라인)",
      moves: "e4 c6 d4 d5 Nd2 dxe4 Nxe4 Nf6 Nxf6+ exf6 Bc4 Qe7+ Qe2 Be6",
    },
    {
      name: "카로칸 - 타르타코워 (6.c3 조용한 전개)",
      moves: "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Nxf6+ exf6 c3 Bd6 Bd3 O-O Nf3 Re8+ Qe2 Bg4",
    },
    {
      name: "카로칸 - 어드밴스 (3.e5)",
      moves: "e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 O-O Nc6",
    },
    {
      name: "카로칸 - 익스체인지 (3.exd5)",
      moves: "e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3 Nf6 Bf4 Bg4",
    },
  ],
};
