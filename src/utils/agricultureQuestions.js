// 种植类问题
const plantingQuestions = [
  '水稻种植技术有哪些？',
  '如何防治小麦赤霉病？',
  '玉米施肥的最佳时间是什么时候？',
  '苹果树春季如何修剪？',
  '葡萄种植需要什么样的土壤条件？',
  '柑橘黄龙病如何防治？',
  '茶树的种植与管理技巧有哪些？',
  '马铃薯种植的最佳季节是什么时候？',
  '大豆根瘤菌的作用是什么？',
  '香蕉种植如何防治枯萎病？',
  '草莓种植的土壤管理技巧？',
  '蔬菜大棚如何控制温湿度？',
  '枸杞高产种植技术有哪些？',
  '花生种植时如何提高产量？',
  '西瓜种植如何选择授粉时间？',
  '云南高原地区茶树种植有什么特殊管理技术？',
  '普洱茶种植的最佳海拔是多少？',
  '云南花卉种植过程中如何预防高原气候的害虫？',
  '高原红土地种植蔬菜需要注意什么？',
  '云南烤烟种植技术要点有哪些？',
  '怎样提高云南高原水果的甜度和品质？',
  '高原地区小粒咖啡种植技术要点？',
  '云南高原夏季蔬菜种植时间规划？',
  '澜沧江流域特色农产品种植技术？',
  '云南藤条作物如何搭架才能提高产量？'
];

// 养殖类问题
const breedingQuestions = [
  '鸡舍消毒的最佳方法是什么？',
  '如何提高奶牛产奶量？',
  '养猪场如何防控非洲猪瘟？',
  '水产养殖中如何控制水质？',
  '蜜蜂养殖的关键技术有哪些？',
  '羊群疾病的早期识别与防治？',
  '如何提高鸡蛋的品质？',
  '淡水鱼养殖的饲料配比？',
  '兔子常见疾病的预防方法？',
  '肉牛育肥的科学饲养方案？',
  '蚕桑养殖技术要点有哪些？',
  '养鸭场如何做好疫病防控？',
  '龙虾养殖的水质管理技巧？',
  '蛋鸡养殖的光照管理？',
  '黄鳝养殖的关键环节有哪些？',
  '云南高原土鸡养殖技术与平原区有什么不同？',
  '高原牦牛养殖需要哪些特殊的饲养条件？',
  '云南特色蜜蜂品种大理蜜蜂的饲养要点？',
  '高山牧场放牧与舍饲结合的最佳方案？',
  '云南石屏黑山羊的饲养管理有何特点？',
  '高原地区特色淡水鱼种养殖技术？',
  '云南高原蚕桑产业的优势与技术要点？',
  '云南彝族地区养猪的传统方式与现代技术结合？',
  '高海拔地区养殖保暖措施有哪些？',
  '云南肉牛养殖的饲料搭配方案？'
];

// 农业技术问题
const agricultureTechQuestions = [
  '农业物联网技术应用有哪些场景？',
  '有机农业认证需要满足什么条件？',
  '农作物轮作的好处是什么？',
  '水肥一体化技术的优势有哪些？',
  '生物农药与化学农药的区别？',
  '精准农业技术如何提高产量？',
  '农业废弃物如何资源化利用？',
  '土壤检测的重要指标有哪些？',
  '农业气象预警信息如何应用？',
  '农田灌溉节水技术有哪些？',
  '如何判断土壤酸碱度？',
  '覆盖栽培技术的优点有哪些？',
  '农作物病虫害绿色防控技术？',
  '设施农业的发展趋势是什么？',
  '农作物新品种的选择标准？',
  '云南高原山地农业如何实现水土保持？',
  '高原特色农业如何应对极端天气？',
  '云南立体农业的技术模式有哪些？',
  '高原农田梯田建设与管理技术？',
  '云南喀斯特地貌区农业技术要点？',
  '高原特色农业物联网应用案例？',
  '云南农业科技园区如何发挥高原气候优势？',
  '高原农业节水灌溉新技术应用？',
  '云南少数民族地区生态农业发展模式？',
  '高原农业防冻害技术措施有哪些？'
];

// 农产品加工问题
const processingQuestions = [
  '农产品冷链物流有哪些注意事项？',
  '果蔬保鲜技术的最新进展？',
  '粮食储存如何防止霉变？',
  '食用菌加工的关键技术？',
  '茶叶加工工艺流程是怎样的？',
  '肉制品加工如何保证食品安全？',
  '果酒酿造的工艺要点有哪些？',
  '中药材产后加工技术？',
  '乳制品加工的卫生标准有哪些？',
  '蜂蜜加工过程中如何保持营养成分？',
  '农产品烘干技术的应用？',
  '果酱制作的工艺流程是什么？',
  '豆制品加工的现代化技术？',
  '农产品包装如何延长保质期？',
  '农产品质量安全追溯体系建设？',
  '云南普洱茶后发酵工艺关键控制点？',
  '高原蜂蜜加工与低海拔蜂蜜加工的区别？',
  '云南特色水果如何延长保鲜期？',
  '高山生态食品加工的品质控制措施？',
  '云南咖啡豆烘焙工艺的特点？',
  '云南少数民族特色食品加工技术？',
  '高原花卉加工与保鲜技术？',
  '云南香料作物加工技术与设备？',
  '高海拔地区农产品冷链物流的特殊要求？',
  '云南中药材规范化加工技术与标准？'
];

// 农业经济问题
const agricultureEconomyQuestions = [
  '农产品电商平台如何选择？',
  '农业合作社组建的关键要素？',
  '农业保险种类及其作用？',
  '如何申请农业补贴？',
  '农产品品牌建设的成功案例？',
  '特色农产品营销策略有哪些？',
  '农业创业的优势项目推荐？',
  '农村土地流转的政策与实践？',
  '农产品出口需要哪些认证？',
  '农业产业化经营的模式有哪些？',
  '乡村旅游开发的成功经验？',
  '农业科技园区的规划建设？',
  '农产品价格形成机制是什么？',
  '农村电商物流配送模式创新？',
  '农业产业融合发展的路径？',
  '云南高原特色农产品品牌化策略？',
  '边境地区农产品贸易政策与机遇？',
  '云南少数民族地区农业合作社发展模式？',
  '高原特色农业与乡村旅游融合发展？',
  '云南咖啡产业链延伸与价值提升？',
  '高原特色农产品地理标志保护申请流程？',
  '云南绿色食品产业发展规划与政策？',
  '高原特色农产品出口东盟市场策略？',
  '云南边疆地区农业发展扶持政策？',
  '高原特色农业数字化转型路径？'
];

// 云南高原特色农业问题
const yunnanHighlandQuestions = [
  '云南三七种植与加工的全产业链技术？',
  '高山云雾茶种植管理技术要点？',
  '云南石斛种植与野生驯化技术？',
  '高原反季节蔬菜种植模式与效益分析？',
  '云南高原水果种植的气候优势利用？',
  '哈尼梯田的水稻种植传统技术与现代改良？',
  '云南高原花卉产业发展现状与前景？',
  '高原特色食用菌栽培技术要点？',
  '云南小粒咖啡与世界咖啡品种的区别？',
  '高原生态畜牧业发展模式创新？',
  '云南特色坚果种植与产业发展？',
  '滇西北高原地区青稞种植技术？',
  '云南特色水果保鲜储运技术？',
  '高原马铃薯种薯繁育技术体系？',
  '云南农业与旅游融合发展模式？',
  '高原特色农产品精深加工技术？',
  '云南民族地区传统农耕文化保护与利用？',
  '高原山地生态农业发展规划？',
  '怒江峡谷农业生产适应性技术？',
  '滇东南喀斯特地区农业发展对策？',
  '古茶树资源保护与合理利用？',
  '云南生物多样性与农业可持续发展？',
  '高原特色畜禽遗传资源保护利用？',
  '沿边地区跨境农业合作模式？',
  '云南农业应对气候变化的适应性策略？'
];

/**
 * 从问题集中随机选择指定数量的问题
 * @param {Array} questionArray 问题数组
 * @param {Number} count 需要的问题数量
 * @returns {Array} 随机选择的问题数组
 */
function getRandomQuestions(questionArray, count) {
  // 复制数组以避免修改原数组
  const questions = [...questionArray];
  const result = [];
  const total = questions.length;

  // 如果请求的数量超过总数，直接返回全部问题
  if (count >= total) {
    return questions;
  }

  // 随机选择问题
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    result.push(questions[randomIndex]);
    // 从候选数组中移除已选问题
    questions.splice(randomIndex, 1);
  }

  return result;
}

/**
 * 获取随机分类的问题
 * @param {Number} count 需要的问题数量
 * @returns {Array} 随机分类的问题数组
 */
export function getRandomAgricultureQuestions(count = 3) {
  // 所有问题类别
  const allCategories = [
    plantingQuestions,
    breedingQuestions,
    agricultureTechQuestions,
    processingQuestions,
    agricultureEconomyQuestions,
    yunnanHighlandQuestions
  ];

  // 随机打乱所有问题类别
  const shuffledCategories = [...allCategories].sort(() => Math.random() - 0.5);

  // 结果数组
  const result = [];

  // 从每个类别选择问题，直到达到需要的数量
  let remainingCount = count;
  let categoryIndex = 0;

  while (remainingCount > 0 && categoryIndex < shuffledCategories.length) {
    // 当前类别
    const currentCategory = shuffledCategories[categoryIndex];

    // 从当前类别选择1个问题（确保每个类别至少有1个问题被考虑）
    const questionsFromCategory = getRandomQuestions(currentCategory, 1);

    // 添加到结果中
    result.push(...questionsFromCategory);

    // 更新计数和索引
    remainingCount--;
    categoryIndex++;
  }

  // 如果还需要更多问题，继续随机选择
  if (remainingCount > 0) {
    // 将所有类别的问题合并到一个数组
    const allQuestions = allCategories.flat();
    // 排除已选的问题
    const remainingQuestions = allQuestions.filter(q => !result.includes(q));
    // 随机选择剩余需要的问题
    const additionalQuestions = getRandomQuestions(remainingQuestions, remainingCount);
    // 添加到结果中
    result.push(...additionalQuestions);
  }

  return result;
}

export const agricultureQuestions = {
  planting: plantingQuestions,
  breeding: breedingQuestions,
  technology: agricultureTechQuestions,
  processing: processingQuestions,
  economy: agricultureEconomyQuestions,
  yunnanHighland: yunnanHighlandQuestions,
  all: [...plantingQuestions, ...breedingQuestions, ...agricultureTechQuestions, ...processingQuestions, ...agricultureEconomyQuestions, ...yunnanHighlandQuestions]
};

export default {
  getRandomAgricultureQuestions,
  agricultureQuestions
};
