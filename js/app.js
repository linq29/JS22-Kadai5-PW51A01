$(document).ready(function () {
  /* ================================
     花札データ定義
  ================================= */

  const fudaInfo = {
    h1: { name: "松に鶴", type: "hikari" },
    h2: { name: "梅に鶯", type: "tane" },
    h3: { name: "桜に幕", type: "hikari" },
    h4: { name: "藤に不如帰", type: "tane" },
    h5: { name: "菖蒲に八ツ橋", type: "tane" },
    h6: { name: "牡丹に蝶", type: "tane" },
    h7: { name: "萩に猪", type: "tane" },
    h8: { name: "芒に月", type: "hikari" },
    h9: { name: "菊に盃", type: "tane" },
    h10: { name: "紅葉に鹿", type: "tane" },
    h11: { name: "柳に小野道風", type: "ame-hikari" },
    h12: { name: "桐に鳳凰", type: "hikari" }
  };

  // 光札・雨札の定義
  const hikariFuda = ['h1', 'h3', 'h8', 'h12'];
  const ameFuda = 'h11';

  // IDから札名・札タイプを取得
  function getFudaName(id) {
    return fudaInfo[id]?.name || "";
  }

  function getFudaType(id) {
    return fudaInfo[id]?.type || "";
  }


  /* ================================
     1. nav固定・スクロール処理
  ================================= */

  const $nav = $("#nav");
  const $mainVisual = $("#main-visual");

  $(window).on("scroll resize", function () {
    const scrollTop = $(window).scrollTop();
    const mainVisualHeight = $mainVisual.outerHeight();

    // nav固定（境界付近のガタつき防止）
    const threshold = mainVisualHeight - 5;
    $nav.toggleClass("fixed", scrollTop > threshold);

    // section表示（初回スクロール時のみ）
    const windowHeight = $(window).height();
    const $fudaThumbnails = $('.fuda-thumbnails');

    $(".scroll-animated-section").each(function () {
      const $section = $(this);
      const sectionTop = $section.offset().top;

      if (
        scrollTop + windowHeight * 0.7 > sectionTop &&
        !$section.hasClass("is-visible")
      ) {
        $section.addClass("is-visible");

        if ($section.attr("id") === "sec-thumbnail") {
          $fudaThumbnails.addClass("is-visible-container");

          setTimeout(() => {
            $('.fuda-thumbnails li img').each(function (i) {
              $(this).delay(i * 100).queue(function (next) {
                $(this).addClass("stagger-in");
                next();
              });
            });
          }, 200);
        }

        if ($section.attr("id") === "sec-yakutsukuri") {
          $('#sec-yakutsukuri .yaku-select-item img').each(function (i) {
            $(this).delay(i * 150).queue(function (next) {
              $(this).addClass("stagger-in");
              next();
            });
          });
        }
      }
    });

    // parallax
    const $secIntro = $("#sec-intro");
    const $secYakutsukuri = $("#sec-yakutsukuri");

    // sec-intro：背景斜め移動
    const introParallax = scrollTop * 0.5;
    $secIntro.css({
      'background-position-x': -introParallax + 'px',
      'background-position-y': -introParallax + 'px'
    });

    // sec-yakutsukuri：背景縦方向移動
    const yakutsukuriOffset = $secYakutsukuri.offset().top;
    const yakutsukuriParallax =
      -(scrollTop - yakutsukuriOffset) * 0.3;

    $secYakutsukuri.css(
      'background-position-y',
      yakutsukuriParallax + 'px'
    );
  });

  $(window).trigger("scroll");


  /* ================================
     2. 札プレビュー切替
  ================================= */

  const $fudaSelect = $("#fuda-select");
  const $fudaIntro = $(".fuda-intro");

  $(".fuda-thumbnails .thumbnail").on("click", function () {
    const src = $(this).attr("src");
    const alt = $(this).attr("alt");

    $fudaSelect.fadeOut(200, function () {
      $(this).attr({ src, alt }).fadeIn(200);
    });

    $fudaIntro.text(alt);
  });


  /* ================================
     3. 役作り判定
  ================================= */

  const selectedYakuFudas = new Set();
  const $yakuFudas = $(".yaku-select-item img");
  const $clearButton = $("#clear-button");
  const $yakuTitle = $("#yaku-name");
  const $currentYaku = $("#current-yaku-display");

  $yakuFudas.on("click", function () {
    const fudaId = $(this).data("id");
    $(this).toggleClass("selected");

    if ($(this).hasClass("selected")) {
      selectedYakuFudas.add(fudaId);
      $(this).next().text(getFudaName(fudaId));
    } else {
      selectedYakuFudas.delete(fudaId);
      $(this).next().text("");
    }

    updateYakuResult();
  });

  $clearButton.on("click", function () {
    $yakuFudas.removeClass("selected");
    $(".selected-yaku-name").text("");
    selectedYakuFudas.clear();
    updateYakuResult();
  });

  function updateYakuResult() {
    const result = judgeHikariYaku([...selectedYakuFudas]);
    $yakuTitle.text(result || "役を作ってみよう");
    $currentYaku.text(result || "なし");
  }


  // 役一覧表示
  $("#show-yaku-list").on("click", function () {
    alert(
      "五　光：光札5枚\n" +
      "四　光：「柳に小野道風」以外4枚\n" +
      "雨四光：「柳に小野道風」を含めて4枚\n" +
      "三　光：「柳に小野道風」以外3枚"
    );
  });

  // 光札の役判定
  function judgeHikariYaku(fudas) {
    const hikari = fudas.filter(
      id => ["hikari", "ame-hikari"].includes(getFudaType(id))
    );
    const ameIn = fudas.includes(ameFuda);

    if (
      hikari.length === 5 &&
      hikariFuda.every(c => hikari.includes(c))
    ) return "五光（ごこう）";

    if (
      ameIn &&
      hikari.length === 4 &&
      hikari.filter(c => c !== ameFuda)
        .every(c => hikariFuda.includes(c))
    ) return "雨四光（あめしこう）";

    if (
      !ameIn &&
      hikari.length === 4 &&
      hikariFuda.every(c => hikari.includes(c))
    ) return "四光（しこう）";

    if (
      !ameIn &&
      hikari.length === 3 &&
      hikari.every(c => hikariFuda.includes(c))
    ) return "三光（さんこう）";

    return null;
  }


  /* ================================
     4. ナビゲーションスムーズスクロール
  ================================= */

  $('#nav ul li a').on('click', function (e) {
    e.preventDefault();
    const targetId = this.hash;

    if ($(targetId).length) {
      $('html, body').animate({
        scrollTop: $(targetId).offset().top
      }, 800);
    }
  });

});