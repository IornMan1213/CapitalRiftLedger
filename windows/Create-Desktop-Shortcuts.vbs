Set oWS = CreateObject("WScript.Shell")
desktop = oWS.SpecialFolders("Desktop")
base = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

Sub MakeShortcut(name, target, args, desc)
  Set s = oWS.CreateShortcut(desktop & "\" & name & ".lnk")
  s.TargetPath = base & "\" & target
  If args <> "" Then s.Arguments = args
  s.WorkingDirectory = base
  s.Description = desc
  s.Save
End Sub

MakeShortcut "Capital Rift — Setup", "1-Setup.cmd", "", "Configure UUID and cookie"
MakeShortcut "Capital Rift — Track", "2-Track-Today.cmd", "", "Fetch today's stats"
MakeShortcut "Capital Rift — Dashboard", "3-Open-Dashboard.cmd", "", "Open local dashboard"
MakeShortcut "Capital Rift — Launch", "Launch.cmd", "", "Track and open dashboard"

MsgBox "Desktop shortcuts created.", 64, "Capital Rift Ledger"
