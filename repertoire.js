// 내 레퍼토리 데이터.
// 여기에 라인을 추가/수정하면 트레이너가 자동으로 인식합니다.
// moves는 공백으로 구분된 SAN(표준 기보) 문자열이며, 항상 백의 1수부터 시작해야 합니다.
// name은 화면에 표시될 라인 이름입니다.

const REPERTOIRE = {
  white: [
    {
      name: "이탈리안 - 지오코 피아노 5.d4 뫼레르 어택 (7.Nc3, 7...Nxe4 60%)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Nc3 Nxe4 O-O Bxc3 d5 Bf6 Re1 Ne7 Rxe4 d6 Bg5 Bxg5 Nxg5 h6",
    },
    {
      name: "이탈리안 - 지오코 피아노 5.d4 뫼레르 어택 (7...O-O 대안, 14%)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Nc3 O-O O-O Bxc3 bxc3 Nxe4 Qd3 d5 Bb3 Bf5 Qe3",
    },
    {
      name: "이탈리안 - 지오코 피아노 5.d4 뫼레르 어택 (7...Bxc3+ 대안, 13%)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Nc3 Bxc3+ bxc3 Nxe4 O-O d5 Bd3 O-O Qc2 Bf5 Re1",
    },
    {
      name: "이탈리안 - 지오코 피아노 5.d4 (6...Bb6 대안, 15%)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb6 e5 Ne4 O-O O-O Re1 d5 exd6 Nxd6 Bb3 Bg4 Be3",
    },
    {
      name: "이탈리안 - 지오코 피아노 5.d4 조용한 라인 (7.Bd2, 7...Bxd2+)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Bd2 Bxd2+ Nbxd2 d5 exd5 Nxd5 Qb3 Nce7 O-O O-O Rfe1 c6",
    },
    {
      name: "이탈리안 - 지오코 피아노 5.d4 조용한 라인 (7.Bd2, 7...Nxe4)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Bd2 Nxe4 Bxb4 Nxb4 Bxf7+ Kxf7 Qb3+ Kf8 Qxb4+ Qe7 Qxe7+ Kxe7",
    },
    {
      name: "투 나이츠 - 나이트 어택 (4.Ng5, 5...Na5 시고린 갬빗)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6 bxc6 Be2 h6 Nf3 e4 Ne5",
    },
    {
      name: "투 나이츠 - 나이트 어택 (4.Ng5, 5...Nd4 프리츠 변형)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nd4 c3 b5 Bf1 Nxd5 cxd4 Qxg5 Bxb5",
    },
    {
      name: "투 나이츠 - 나이트 어택 (4.Ng5, 5...Nxd5?! 프라이드 리버)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7 Kxf7 Qf3+ Ke6 Nc3 Nb4",
    },
    {
      name: "이탈리안 게임 - 헝가리안 디펜스 (3...Be7)",
      moves: "e4 e5 Nf3 Nc6 Bc4 Be7 d3 Nf6 c3 d6 O-O O-O Re1 a6",
    },
    {
      name: "이탈리안 - 3...h6 대응 (실전 3위 응수, 14.6%)",
      moves: "e4 e5 Nf3 Nc6 Bc4 h6 d4 exd4 Nxd4 Nxd4 Qxd4 d6 O-O Nf6 e5 dxe5 Qxe5+",
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
      name: "카로칸 - 타르타코워 (6.Nf3, 실전 최다 응수 44%)",
      moves: "e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Nxf6+ exf6 Nf3 Bd6 Bd3 O-O O-O Bg4 h3 Bh5",
    },
    {
      name: "카로칸 - 어드밴스 (3.e5, 4.Nf3 숏 시스템)",
      moves: "e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 O-O Nc6",
    },
    {
      name: "카로칸 - 어드밴스 (3.e5, 4.Bd3 비숍 교환, 실전 2위 22%)",
      moves: "e4 c6 d4 d5 e5 Bf5 Bd3 Bxd3 Qxd3 e6 Nf3 c5 c3 Nc6 O-O Qb6",
    },
    {
      name: "카로칸 - 어드밴스 (3.e5, 4.g4 베이오넷 어택)",
      moves: "e4 c6 d4 d5 e5 Bf5 g4 Be4 f3 Bg6 h4 h5 Ne2 hxg4 fxg4 e6",
    },
    {
      name: "카로칸 - 익스체인지 (3.exd5, 4.Bd3)",
      moves: "e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3 Nf6 Bf4 Bg4",
    },
    {
      name: "카로칸 - 익스체인지 (3.exd5, 4.Nf3, 실전 최다 응수 28%)",
      moves: "e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6 Bb5 Bg4 O-O e6 h3 Bxf3 Qxf3 Nf6 Bg5 Be7 Nc3 O-O",
    },
    {
      name: "카로칸 - 익스체인지 (3.exd5, 4.Nc3, 18%)",
      moves: "e4 c6 d4 d5 exd5 cxd5 Nc3 Nf6 Nf3 Bg4 Be2 e6 O-O Nc6 h3 Bh5",
    },
    {
      name: "카로칸 - 파노프-보트비닉 어택 (5...e6, 31%)",
      moves: "e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 e6 Nf3 Be7 cxd5 Nxd5 Bd3 Nc6 O-O O-O Re1 Bf6",
    },
    {
      name: "카로칸 - 파노프-보트비닉 어택 (5...Nc6, 실전 최다 36%)",
      moves: "e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 Nc6 Nf3 Bg4 cxd5 Nxd5",
    },
  ],
};
