import UserModel from "../model/UserModel";

function calculateLevelIncome(refby, amount, level = 1) {
  if (refby === "") return;
  if (level == 20) return;

  const weight = [0, 0.05, 0.01, 0.008, 0.005, 0.003];

  const deposit = level < 6 ? amount * weight[level] : amount * 0.001;

  UserModel.findOneAndUpdate(
    { refCode: refby },
    { $inc: { "wallet.balance": deposit } }
  )
    .then((user) => {
      calculateLevelIncome(user.refBy, amount, level++);
    })
    .catch((e) => {
      var a = localStorage.getItem("failLevelincomeLogs");
      if (a) {
        var logs = JSON.parse(a);
        logs.logs.push(
          `can't able to deposit level income and imterrupt by this param ${refby} , ${level} , ${amount}`
        );
      } else {
        a = {
          logs: [],
        };

        a.logs.push(
          `can't able to deposit level income and imterrupt by this param ${refby} , ${level} , ${amount}`
        );
        localStorage.setItem("failLevelincomeLogs", JSON.stringify(a));
      }
    });
}

async function dailyRoutine() {
  var users = await UserModel.find()
    .then((doc) => doc)
    .catch((e) => false);
  if (!users) return;

  users = users.filter((user) => {
    return user.status;
  });

  var rate = [0, 0.017, 0.014, 0.01, 0.005, 0.003];

  users.map((user) => {
    const deposit = user.principle.balance * rate[user.multiple];
    var update = {
      $inc: { "wallet.balance": deposit },
    };
    if (!user.principle.freeze) {
      if (user.withdrawToday) {
        update = { ...update, withdrawToday: false };
      } else {
        update = { ...update, status: false };
      }
    }
    UserModel.findOneAndUpdate({ _id: user._id }, update)
      .then((doc) => {
        return true;
      })
      .catch((e) => {
        var logs = localStorage.getItem("dailyRoutineLogs");
        var a;
        if (logs) {
          a = JSON.parse(logs);
        } else {
          a = {
            logs: [],
          };
        }
        a.logs.push(
          `this is routine check up gte error on this person ${user._id}`
        );
        localStorage.setItem("dailyRoutineLogs", JSON.stringify(a));
      });
  });
}
