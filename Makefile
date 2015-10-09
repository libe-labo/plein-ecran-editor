PIP = pip3
PIP_FOLDER = .pip
PYTHON = python3

CONTENT-TOOLS_URL = https://github.com/GetmeUK/ContentTools/archive/master.zip
CONTENT-TOOLS_SRC_FOLDER = ContentTools-master/
CONTENT-TOOLS_DEST_FOLDER = static/content-tools/

WGET = curl -OL
UNZIP = unzip -q
CP = cp -R
RM = rm -fr

all : install run

run :
	@PYTHONPATH=@PYTHONPATH:./$(PIP_FOLDER) $(PYTHON) ./flaskr.py

install : pipinstall installcontenttools

pipinstall :
	$(PIP) install -t $(PIP_FOLDER) -r requirements.txt --upgrade

# Quick and dirty
installcontenttools :
	$(RM) master.zip
	$(WGET) $(CONTENT-TOOLS_URL)
	$(UNZIP) master.zip
	$(CP) $(CONTENT-TOOLS_SRC_FOLDER)build/images $(CONTENT-TOOLS_DEST_FOLDER)
	$(CP) $(CONTENT-TOOLS_SRC_FOLDER)build/content-tools.min.css $(CONTENT-TOOLS_DEST_FOLDER)
	$(CP) $(CONTENT-TOOLS_SRC_FOLDER)build/content-tools.min.js $(CONTENT-TOOLS_DEST_FOLDER)
	$(RM) $(CONTENT-TOOLS_SRC_FOLDER)
	$(RM) master.zip
