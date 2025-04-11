import { defineComponent } from "vue";
import { X } from "lucide-vue-next";

export const LotteryHelp = defineComponent({
  name: "LotteryHelp",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const close = () => {
      emit("close");
    };

    return () =>
      props.show ? (
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] p-6 shadow-xl overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-800">抽奖系统使用说明</h2>
              <button
                class="rounded-full p-1 hover:bg-gray-100 transition-colors"
                onClick={close}
              >
                <X class="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div class="space-y-6">
              {/* 系统介绍 */}
              <div class="border-b pb-4">
                <h3 class="text-base font-medium text-orange-600 mb-2">
                  系统介绍
                </h3>
                <p class="text-sm text-gray-700 mb-2">
                  抽奖直播系统是一款专为直播间抽奖活动设计的工具，帮助主播快速公平地从观众中抽取幸运用户，提升直播互动性和趣味性。
                </p>
                <p class="text-sm text-gray-700">
                  系统支持两个抽奖区域：
                  <span class="font-medium text-orange-600">尊享专区</span>和
                  <span class="font-medium text-blue-600">福利专区</span>，
                  观众可通过不同方式参与抽奖，增加中奖机会。
                </p>
              </div>

              {/* 开始使用 */}
              <div class="border-b pb-4">
                <h3 class="text-base font-medium text-orange-600 mb-2">
                  开始使用
                </h3>
                <div class="space-y-2">
                  <div>
                    <h4 class="text-sm font-medium text-gray-700">
                      1. 设置直播间
                    </h4>
                    <p class="text-sm text-gray-600 ml-4">
                      • 点击页面顶部的「
                      <span class="text-orange-500">抽奖准备</span>」按钮
                      <br />
                      • 输入直播间ID并点击「获取」按钮
                      <br />• 确认直播间信息无误后开始抽奖
                    </p>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-700">
                      2. 充电阶段
                    </h4>
                    <p class="text-sm text-gray-600 ml-4">
                      • 点击「<span class="text-orange-500">开始充电</span>
                      」按钮，系统将开始收集观众互动信息
                      <br />
                      • 充电期间，观众通过参与互动加入抽奖池：
                      <br />
                      <span class="ml-6">
                        - 送礼物的观众将进入
                        <span class="text-orange-500 font-medium">
                          尊享专区
                        </span>
                        ，中奖概率更高
                      </span>
                      <br />
                      <span class="ml-6">
                        - 发言、点赞、分享的观众将进入
                        <span class="text-blue-500 font-medium">福利专区</span>
                      </span>
                      <br />•
                      充电时间结束后，或手动点击「停止充电」按钮结束充电阶段
                    </p>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-700">
                      3. 抽奖阶段
                    </h4>
                    <p class="text-sm text-gray-600 ml-4">
                      • 充电结束后，点击「
                      <span class="text-blue-500">开始抽奖</span>」按钮
                      <br />
                      • 系统将根据设置从尊享专区和福利专区分别抽取幸运用户
                      <br />•
                      抽奖结果将实时显示在界面上，每一轮中奖用户在中奖信息中显示
                    </p>
                  </div>
                </div>
              </div>

              {/* 系统设置 */}
              <div class="border-b pb-4">
                <h3 class="text-base font-medium text-orange-600 mb-2">
                  系统设置
                </h3>
                <p class="text-sm text-gray-700 mb-2">
                  点击顶部的「<span class="text-orange-500">设置</span>
                  」按钮可以自定义抽奖系统：
                </p>
                <div class="space-y-2 text-sm text-gray-600 ml-4">
                  <div>
                    <span class="font-medium text-gray-700">• 口令抽奖：</span>
                    开启后观众需要发送正确的抽奖口令才能参与抽奖
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">
                      • 最低开奖人数：
                    </span>
                    当参与人数不足时，系统不会开奖
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">• 抽奖模式：</span>
                    <p class="ml-4">
                      - 固定模式：每次从奖池抽取固定数量的用户
                      <br />-
                      比例模式：根据参与总人数按比例抽取用户（如每10人抽1个）
                    </p>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">• 充电时间：</span>
                    设置每轮充电的持续时间（秒）
                  </div>
                </div>
              </div>

              {/* 参与规则 */}
              <div class="border-b pb-4">
                <h3 class="text-base font-medium text-orange-600 mb-2">
                  参与规则
                </h3>
                <div class="space-y-2">
                  <div class="bg-orange-50 p-3 rounded-md border border-orange-100">
                    <h4 class="text-sm font-medium text-orange-700">
                      尊享专区规则
                    </h4>
                    <p class="text-sm text-orange-600">
                      • 观众在充电期间赠送任意非免费礼物即可进入尊享专区
                      <br />
                      • 礼物价值越高，在尊享专区的权重越大，中奖概率越高
                      <br />• 尊享专区的中奖概率高于福利专区
                    </p>
                  </div>
                  <div class="bg-blue-50 p-3 rounded-md border border-blue-100">
                    <h4 class="text-sm font-medium text-blue-700">
                      福利专区规则
                    </h4>
                    <p class="text-sm text-blue-600">
                      • 观众在充电期间通过以下方式进入福利专区：
                      <br />
                      &nbsp;&nbsp;- 发送弹幕消息（可设置需发送口令）
                      <br />
                      &nbsp;&nbsp;- 分享直播间
                      <br />
                      &nbsp;&nbsp;- 关注主播
                      <br />
                      &nbsp;&nbsp;- 进入直播间
                    </p>
                  </div>
                </div>
              </div>

              {/* 注意事项 */}
              <div>
                <h3 class="text-base font-medium text-orange-600 mb-2">
                  注意事项
                </h3>
                <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>充电期间观众离开直播间会失去抽奖资格</li>
                  <li>每轮抽奖结束后，需要重新开始充电才能进行下一轮抽奖</li>
                  <li>建议在主播公布奖品后再开始充电，以提高观众参与积极性</li>
                  <li>可以根据直播间人气和奖品价值调整充电时间和抽奖人数</li>
                  <li>若出现连接中断，可重新连接直播间并开始新一轮抽奖</li>
                </ul>
              </div>

              {/* 关闭按钮 */}
              <div class="flex justify-end pt-2">
                <button
                  class="px-4 py-2 rounded bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
                  onClick={close}
                >
                  了解了
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null;
  },
});
