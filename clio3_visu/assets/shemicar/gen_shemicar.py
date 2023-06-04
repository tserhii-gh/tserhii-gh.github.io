#!/usr/bin/env python3

import json
import re
from pathlib import Path

GEN = "gen_shemicar.json"

gen = []
r = re.compile(r"(.*)\n(.*)\n")

for x in [d for d in Path().absolute().iterdir() if d.is_file()]:
  if x.suffix == ".txt":
    with open(x, encoding="utf-8") as f:
      cdict = {}
      htm = f.readlines()
      cdict["id"] = x.stem
      cdict["title"] = (htm[0]).rstrip(".\n")

      # print(htm[0])
      res = re.findall(r, "".join(htm[1:]))
      for i in res:
        # print(i)
        cdict.setdefault("blocks", []).append({
            "block_id": i[0],
            "block_desc": i[1]
        })
      gen.append(cdict)
      # print(res)
      # for l in htm[1:]:
      #   print("".join(l))
      # cdict["id"] =l
      # continue

      # print(htm[0])

with open(GEN, "w", encoding="utf-8") as j:
  j.write(json.dumps(gen, ensure_ascii=False))

# with open("abs_esp.txt", encoding="utf-8") as f:
#   cdict = {}
#   htm = f.readlines()
#   cdict["id"] = (htm[0]).rstrip("\n")
#   res = re.findall(r, "".join(htm[1:]))
#   for i in res:
#     print(i)
#     cdict.setdefault("blocks", []).append({
#         "block_id": i[0],
#         "block_desc": i[1]
#     })
#   print(cdict)
