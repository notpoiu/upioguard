local function Wrapper(Function: (...any) -> (...any), NewEnv: {[any]: any})
  local normalEnv = getfenv(Function)

  setfenv(Function, setmetatable(NewEnv, {__index = normalEnv}))

  return Function
end

local WrappedEnv = Wrapper(function()
  ${returned_content}
end, {
  upioguard = {
    username = "${user_data.username}",
    userid = "${user_data.discord_id}",
    note = "${user_data.note}",
    hwid = "${fingerprint}",
    script_name = "${project_data.name}",
    expiry = ${user_data.expiry},
    is_premium = ${user_data.is_premium},
  }
})

WrappedEnv()