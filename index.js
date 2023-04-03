const mysql = require('mysql');

// 클래스 정의
class Pokemon {
  constructor(name, type, level) {
    this.name = name;
    this.type = type;
    this.level = level;
  }

  // getter 메서드는 문장을 만드는 기능을 한다.
  get info() {
    return `이름: ${this._name}, 타입: ${this._type}, 레벨: ${this._level}`;
  }

  // setter 메서드는 데이터 타입을 검사해 안전성을 높인다.
  set name(value) {
    if (typeof value === "string") {
      this._name = value;
    } else {
      console.log("이름은 문자열로 입력해주세요.");
    }
  }

  set type(value) {
    if (typeof value === "string") {
      this._type = value;
    } else {
      console.log("타입은 문자열로 입력해주세요.");
    }
  }

  set level(value) {
    if (typeof value === "number") {
      this._level = value;
    } else {
      console.log("레벨은 숫자로 입력해주세요.");
    }
  }
}

// 데이터베이스 연결 정보 configuaration "정의"라는 단어를 줄여서 config라고 부른다.
// 데이터베이스 모듈이 필요한 정보에 대해 "객체"로 받는 것을 조건으로 둔 것에 주목
// 실제 서비스에서는 config 파일을 환경변수 등 (시스템에 의존하는 변수)으로 활용한다.
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'POKEMON EXAMPLE',
  port: 3306, // MySQL 포트 (일반적으로 3306)
  connectionLimit: 5, // 동시에 DB에 접속 가능한 클라이언트 5개.(클라이언트 = 개발자들)
  waitForConnections: true // 클라이언트가 연결을 요청할 때 대기 여부
};

// javascript 14번 예제의 5번 코드인 '객체를 변환하는 함수' 참고
function convertPokemonToJSON(pokemon) {
  return JSON.stringify({
    name: pokemon._name,
    type: pokemon._type,
    level: pokemon._level
  });
};

// 보통의 경우
// calss를 선언한 코드와 JSON 으로 변환하는 함수코드는 분리되어 있다.
// 본 예제에서는 굳이 JSON으로 바꾸지 않아도 데이터베이스에 create(생성) 되지만
// 실무에서 JSON 으로 내보내고 가져오는 경우가 많다.
// 하나의 '객체'를 다른 '객체'로 변환하는 것을 '직렬화'라고 한다.
// JSON 포멧은 다른 언어어세도(파이썬 등) 범용성이 무궁무진하고
// 분리되는 과정 자체가 서비스 측면에서는 보안적으로도 중요하다.
// Node.js 특성상 JSON.parse()메서드가 내장메서드이기 때문에 상당히 간편하다.

// 포켓몬 정보를 DB 테이블에 저장하는 함수
function savePokemonJSONToDatabase(pokemonJSON) {
  // 데이터베이스 연결 생성
  const connection = mysql.createConnection(dbConfig);

  // 연결 시작
  connection.connect((err) => {
    if (err) {
      console.error('연결실패', err);
      return;
    }
    console.log('3306 포트로 연결 성공');

    // JSON 데이터 파싱하여 결과적으로 다시 객체가 된다.
    const pokemonData = JSON.parse(pokemonJSON);

    // 포켓몬 정보 삽입 쿼리
    const query = 'INSERT INTO pokemon (name, type, level) VALUES (?, ?, ?)';
    /*
    쿼리문은 기본 기조가 '무엇을' '어디에' '어떻게' 이다.
    영어의 어순을 그대로 따르는 것이 특징이다.
    삽입하겠다. (INSERT INTO)
    pokemon 이라는 테이블에, 열(column)은 name, type, level 세칸이다.
    그리고 그 열에 들어갈 데이터는 ? 로 표시한다.
    이때 ? 는 '값'이 아니라 '값의 위치'를 의미하므로 '함수의 매개변수'와 같다.
    */
   const values = [pokemonData.name, pokemonData.type, pokemonData.level];

   // 쿼리 실행
   connection.query(query, values, (err, results) => {
    if (err) {
      console.error('쿼리실행 실패', err);
      return;
    }
    console.log('결과물 확인', results);

    // 연결 종료
    connection.end();
   });
  });
}
/*
.connect()
.query()
.end()
위 세개의 메서드는 세트로 사용되는 경우가 많다.
마치 HTTP 모듈의 writeHead, write, end 메서드와 꼭 닮았다.
이렇게 "묶음단위"로 실행되는 동작형태를 공학적 용어로 트랜잭션(transaction)이라고 한다.
*/

const pikachu = new Pokemon('피카츄', '전기', 10);
const pikachuJSON = convertPokemonToJSON(pikachu);
savePokemonJSONToDatabase(pikachuJSON);
