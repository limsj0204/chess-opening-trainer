// 내 레퍼토리 데이터.
// 여기에 라인을 추가/수정하면 트레이너가 자동으로 인식합니다.
// moves는 공백으로 구분된 SAN(표준 기보) 문자열이며, 항상 백의 1수부터 시작해야 합니다.
// name은 화면에 표시될 라인 이름입니다.

const REPERTOIRE = {
  white: [
    {
      name: "이탈리안 게임 - 지오코 피아노 (3...Bc5)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6 a4 Ba7",
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
      name: "카로칸 - 클래시컬 (3.Nc3)",
      moves: "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3 Bxd3 Qxd3 e6",
    },
    {
      name: "카로칸 - 클래시컬 (3.Nd2 이적)",
      moves: "e4 c6 d4 d5 Nd2 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3 Bxd3 Qxd3 e6",
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
