# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "centos/7"

  # ホストPCとゲストPCのネットワークを構築
  config.vm.network "private_network", type: "dhcp"

  # ホストPCのこのフォルダをマウント
  config.vm.synced_folder ".", "/vagrant", type: "virtualbox"

  # VM環境設定
  config.vm.provider "hyperv" do |vb, override|
    vb.cpus = 1
    vb.memory = "1024"
    override.vm.synced_folder ".", "/vagrant", type: "smb", mount_options: ["dir_mode=0777,file_mode=0777"]
  end
  config.vm.provider "virtualbox" do |vb|
      vb.cpus = 1
      vb.memory = "1024"
  end

  # ゲストPCにansibleをインストールし共有フォルダのプレイブックを実行
  config.vm.provision "ansible_local" do |ansible|
    ansible.playbook = "ansible/playbook.yml"
    ansible.provisioning_path = "/vagrant/"
  end

  # 各種サービスが共有フォルダマウント前に起動してエラーになるので、再読み込みさせる
  config.vm.provision "shell", run: "always" do |s|
    s.inline = "ip addr ; sudo systemctl restart pm2-vagrant"
  end
end
